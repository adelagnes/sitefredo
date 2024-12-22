// SITEFREDO.js

let scrolling;
let speed = 1;

// Mise à jour de la vitesse
document.getElementById('speed').addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    document.getElementById('speed-display').textContent = speed;
});

// Bouton "Commencer"
document.getElementById('start-btn').addEventListener('click', () => {
    const textInput = document.getElementById('text-input').value.trim();
    const textViewer = document.getElementById('text-viewer');

    if (!textInput) {
        alert('Veuillez entrer du texte.');
        return;
    }

    textViewer.innerHTML = textInput.replace(/\n/g, '<br>');
    textViewer.style.transform = 'translateY(0px)';
    clearInterval(scrolling);

    let scrollPosition = 0;
    const viewerHeight = document.querySelector('.viewer').clientHeight;
    const textHeight = textViewer.scrollHeight;
 
    scrolling = setInterval(() => {
        scrollPosition += speed;
        textViewer.style.transform = `translateY(-${scrollPosition}px)`;

        if (scrollPosition >= textHeight - viewerHeight) {
            clearInterval(scrolling);
        }
    }, 100);
});

// Bouton "Arrêter"
document.getElementById('stop-btn').addEventListener('click', () => {
    clearInterval(scrolling);
});

// Bouton "Importer un PDF"
document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const textInput = document.getElementById('text-input');

    if (!file) {
        alert('Aucun fichier sélectionné.');
        return;
    }

    if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async function () {
            try {
                const pdfData = new Uint8Array(reader.result);
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    let pageText = '';
                    let lastY = null;

                    textContent.items.forEach((item) => {
                        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 10) {
                            pageText += '\n'; // Ajoute un saut de ligne
                        }

                        if (item.transform[4] > 50) {
                            pageText += ' '.repeat(Math.floor(item.transform[4] / 10)); // Ajoute des espaces
                        }

                        pageText += item.str;
                        lastY = item.transform[5];
                    });

                    fullText += pageText + '\n\n';
                }

                textInput.value = fullText;
            } catch (error) {
                alert('Erreur lors de la lecture du fichier PDF.');
                console.error(error);
            }
        };

        reader.readAsArrayBuffer(file);
    } else if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = () => {
            textInput.value = reader.result;
        };
        reader.readAsText(file);
    } else {
        alert('Type de fichier non supporté. Veuillez sélectionner un fichier PDF ou TXT.');
    }
});

// Importer une musique
document.getElementById('import-audio-btn').addEventListener('click', () => {
    document.getElementById('audio-input').click();
});

document.getElementById('audio-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const audioPlayer = document.getElementById('audio-player');

    if (file) {
        const fileURL = URL.createObjectURL(file);
        audioPlayer.src = fileURL;
        audioPlayer.style.display = 'block';

        // Synchroniser les paroles avec la musique
        audioPlayer.addEventListener('timeupdate', () => {
            const textViewer = document.getElementById('text-viewer');
            const viewerHeight = document.querySelector('.viewer').clientHeight;
            const textHeight = textViewer.scrollHeight;
            const maxScroll = textHeight - viewerHeight; // Calcul une seule fois
            const currentTime = audioPlayer.currentTime;
            const duration = audioPlayer.duration;

            if (duration && maxScroll > 0) {
                // Calcule la position en fonction du temps courant
                const scrollPosition = (currentTime / duration) * maxScroll;

                // Applique la transformation avec une transition fluide
                textViewer.style.transition = 'transform 0.2s linear';
                textViewer.style.transform = `translateY(-${scrollPosition}px)`;
            }

            // Fin de la piste : assure que le texte reste à la fin
            if (currentTime >= duration) {
                textViewer.style.transform = `translateY(-${maxScroll}px)`;
            }
        });
    }
});
