let compressing = false;

document.querySelectorAll('.drop-container').forEach(container => {
    container.ondragover = container.ondragenter = (event) => {
        event.preventDefault();

        if (compressing) return;
        
        if (!container.classList.contains('drag'))
            container.classList.add('drag');        

        if (container.classList.contains('err'))
            container.classList.remove('err');
    }

    container.ondragleave = () => {
        if (compressing) return;

        if (container.classList.contains('drag'))
            container.classList.remove('drag');
    }

    container.ondrop = (event) => {
        event.preventDefault();

        if (compressing) return;

        if (container.classList.contains('drag'))
            container.classList.remove('drag');

        const file  = event.dataTransfer.files[0];
        const valid = [ 'image/png', 'image/jpeg' ];
        
        if (valid.includes(file.type)) {
            compressing = true;
            const progress = container.children[1];

            container.style.padding  = '100px 150px';
            progress.style.maxHeight = '300px';
            progress.style.overflow  = 'visible';

            progress.children[0].textContent = file.name;

            container.children[0].children[1].children[0].textContent = 'Compressing...';
            container.children[0].children[1].children[1].textContent = 'That shouldnt take that long';
            compressFile(container, progress.children[1], file, showDownload);
        } else {
            container.classList.add('err');
        }
    }
});

async function compressFile(container, progress, file, listener) {
    progress.style.width = '10%';

    const compress64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            let base = reader.result;
            const img = new Image();
            img.src = base;

            img.onload = () => {
                progress.style.width = '60%';

                const compressCanvas = document.createElement('canvas');

                let factor = 5; // adjust this: hight = more compression (5 is much to high, but for demonstration its good)
                let w = img.width / factor, h = img.height / factor;

                compressCanvas.width  = w;
                compressCanvas.height = h;

                const ctx = compressCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                progress.style.width = '80%';

                const data = ctx.canvas.toDataURL(img,  .5);

                progress.style.width = '90%';
                resolve(data);
            };
        };
        reader.onerror = error => reject(error);
    });

    listener(container, progress, await compress64(file), file.name);
    progress.style.width = '100%';
}

function showDownload(container, progress, compressed, name) {
    setTimeout(() => {
        container.children[0].children[1].children[0].textContent = 'Your File is ready';
        container.children[0].children[1].children[1].textContent = 'Click below to download the File'; 

        progress.parentNode.children[0].textContent     = 'Download my Compressed Image';
        progress.parentNode.children[0].style.left      = '50%';
        progress.parentNode.children[0].style.transform = 'translateY(-55%) translateX(-50%)';

        progress.parentNode.classList.add('dl');


        const link = document.createElement('a');
        link.setAttribute('download', name);
        link.setAttribute('href', compressed);

        progress.parentNode.addEventListener('click', () => {
            link.click();
        });
    }, 2000);
}