export const offline = (() => {

    let alert = null;
    let online = null;

    const show = (isUp) => new Promise((res) => {
        let op = parseFloat(alert.style.opacity);
        let clear = null;

        const callback = () => {
            if (!isUp && op > 0) {
                op -= 0.05;
                alert.style.opacity = op.toFixed(2);
                return;
            }

            if (isUp && op < 1) {
                op += 0.05;
                alert.style.opacity = op.toFixed(2);
                return;
            }

            res();
            clearInterval(clear);
            clear = null;

            if (op <= 0) {
                alert.style.opacity = '0';
                return;
            }

            if (op >= 1) {
                alert.style.opacity = '1';
                return;
            }
        };

        clear = setInterval(callback, 10);
    });

    const setOffline = () => {
        const el = alert.firstElementChild.firstElementChild;
        el.classList.remove('bg-success');
        el.classList.add('bg-danger');
        el.firstElementChild.innerHTML = '<i class="fa-solid fa-ban me-1"></i>Koneksi tidak tersedia';
    };

    const setOnline = () => {
        const el = alert.firstElementChild.firstElementChild;
        el.classList.remove('bg-danger');
        el.classList.add('bg-success');
        el.firstElementChild.innerHTML = '<i class="fa-solid fa-cloud me-1"></i>Koneksi tersedia kembali';
    };

    const onOffline = () => {
        online = false;
        setOffline();
        show(true);

        const elements = document.querySelectorAll('button[offline-disabled], input[offline-disabled], select[offline-disabled], textarea[offline-disabled]');
        elements.forEach((e) => {
            if (e.tagName === 'BUTTON') {
                e.classList.add('disabled');
            } else {
                e.setAttribute('disabled', 'true');
            }
            e.dispatchEvent(new Event('offline'));
        });
    };

    const onOnline = () => {
        online = true;
        setOnline();

        let timeout = null;
        timeout = setTimeout(async () => {
            clearTimeout(timeout);
            timeout = null;
            await show(false);
            setOffline();
        }, 3000);

        const elements = document.querySelectorAll('button[offline-disabled], input[offline-disabled], select[offline-disabled], textarea[offline-disabled]');
        elements.forEach((e) => {
            if (e.tagName === 'BUTTON') {
                e.classList.remove('disabled');
            } else {
                e.removeAttribute('disabled');
            }
            e.dispatchEvent(new Event('online'));
        });
    };

    const isOnline = () => {
        return online;
    };

    const init = () => {
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        alert = document.getElementById('offline-mode');
    };

    return {
        init,
        isOnline,
    };
})();