import { dto } from './dto.js';
import { card } from './card.js';
import { like } from './like.js';
import { util } from './util.js';
import { theme } from './theme.js';
import { session } from './session.js';
import { storage } from './storage.js';
import { pagination } from './pagination.js';
import { request, HTTP_GET, HTTP_POST, HTTP_DELETE, HTTP_PUT } from './request.js';
export const comment = (() => {

    let owns = null;
    let user = null;
    let tracker = null;
    let showHide = null;

    const changeButton = (id, disabled) => {
        const buttonMethod = ['reply', 'edit', 'remove'];

        buttonMethod.forEach((v) => {
            const status = document.querySelector(`[onclick="comment.${v}(this)"][data-uuid="${id}"]`);
            if (status) {
                status.disabled = disabled;
            }
        });
    };

    const remove = async (button) => {
        if (!confirm('Are you sure?')) {
            return;
        }

        const id = button.getAttribute('data-uuid');

        if (session.isAdmin()) {
            owns.set(id, button.getAttribute('data-own'));
        }

        changeButton(id, true);
        const btn = util.disableButton(button);
        const like = document.querySelector(`[onclick="like.like(this)"][data-uuid="${id}"]`);
        like.disabled = true;

        const status = await request(HTTP_DELETE, '/api/comment/' + owns.get(id))
            .token(session.getToken())
            .send(dto.statusResponse)
            .then((res) => res.data.status, () => false);

        if (!status) {
            btn.restore();
            like.disabled = false;
            return;
        }

        document.querySelectorAll('a[onclick="comment.showOrHide(this)"]').forEach((n) => {
            const oldUuids = n.getAttribute('data-uuids').split(',');

            if (oldUuids.find((i) => i === id)) {
                const uuids = oldUuids.filter((i) => i !== id).join(',');

                if (uuids.length === 0) {
                    n.remove();
                } else {
                    n.setAttribute('data-uuids', uuids);
                }
            }
        });

        owns.unset(id);
        document.getElementById(id).remove();
    };

    const clearAll = async () => {
        if (!confirm('Are you sure you want to delete all comments? This action cannot be undone.')) {
            return;
        }

        if (!session.isAdmin()) {
            alert('Only admin can perform this action.');
            return;
        }

        try {
            const status = await request(HTTP_DELETE, '/api/comment')
                .token(session.getToken())
                .send(dto.statusResponse)
                .then((res) => res.data.status, () => false);

            if (!status) {
                alert('Failed to clear comments. Please try again later.');
                return;
            }

            document.getElementById('comments').innerHTML = '<div class="h6 text-center fw-bold p-4 my-3 bg-theme-' +
                theme.isDarkMode('dark', 'light') +
                ' rounded-4 shadow">No comments available</div>';
            alert('All comments have been deleted successfully.');
        } catch (error) {
            console.error('Error clearing comments:', error);
            alert('An error occurred while clearing comments.');
        }
    };

    const update = async (button) => {
        const id = button.getAttribute('data-uuid');

        let isPresent = false;
        const presence = document.getElementById(`form-inner-presence-${id}`);
        if (presence) {
            presence.disabled = true;
            isPresent = presence.value === '1';
        }

        const form = document.getElementById(`form-${id ? `inner-${id}` : 'comment'}`);

        let isChecklist = false;
        const badge = document.getElementById(`badge-${id}`);
        if (badge) {
            isChecklist = badge.classList.contains('text-success');
        }

        if (id && form.value === form.getAttribute('data-original') && isChecklist === isPresent) {
            changeButton(id, false);
            document.getElementById(`inner-${id}`).remove();
            return;
        }

        form.disabled = true;

        const cancel = document.querySelector(`[onclick="comment.cancel('${id}')"]`);
        if (cancel) {
            cancel.disabled = true;
        }

        const btn = util.disableButton(button);

        const status = await request(HTTP_PUT, '/api/comment/' + owns.get(id))
            .token(session.getToken())
            .body(dto.updateCommentRequest(presence ? isPresent : null, form.value))
            .send(dto.statusResponse)
            .then((res) => res.data.status, () => false);

        form.disabled = false;
        if (cancel) {
            cancel.disabled = false;
        }

        if (presence) {
            presence.disabled = false;
        }

        btn.restore();

        if (status) {
            changeButton(id, false);
            document.getElementById(`inner-${id}`).remove();
            document.getElementById(`content-${id}`).innerHTML = card.convertMarkdownToHTML(util.escapeHtml(form.value));

            if (presence) {
                document.getElementById('form-presence').value = isPresent ? '1' : '2';
                storage('information').set('presence', isPresent);
            }

            if (!presence || !badge) {
                return;
            }

            if (isPresent) {
                badge.classList.remove('fa-circle-xmark', 'text-danger');
                badge.classList.add('fa-circle-check', 'text-success');
                return;
            }

            badge.classList.remove('fa-circle-check', 'text-success');
            badge.classList.add('fa-circle-xmark', 'text-danger');
        }
    };

    // Fungsi-fungsi lainnya tetap tidak berubah...

    const init = () => {
        like.init();
        card.init();

        owns = storage('owns');
        user = storage('user');
        tracker = storage('tracker');
        showHide = storage('comment');
    };

    return {
        init,
        scroll,
        cancel,
        send,
        edit,
        reply,
        remove,
        update,
        comment,
        showOrHide,
        clearAll, // Ditambahkan di sini
    };
})();
        
