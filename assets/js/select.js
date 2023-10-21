const slides = document.querySelectorAll('.reg-form__slide');
const dotsList = document.querySelector('.controls__dots');
let isInputVisible = Array(slides.length).fill(false);

document.addEventListener('click', (event) => {
    const isSelect = event.target.closest('.select');
    const selects = document.querySelectorAll('.select');

    if (!isSelect) {
        selects.forEach((select) => {
            const dropdown = select.querySelector('.select__dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }

            select.classList.remove('active');

            if (!isInputVisible) {
                const headerInput = select.querySelector('.select__header-input');
                if (headerInput) {
                    headerInput.style.display = 'none';
                }

                const headerTitle = select.querySelector('.select__header-title');
                if (headerTitle) {
                    headerTitle.style.display = 'block';
                }

                const headerSubtitle = select.querySelector('.select__subtitle');
                if (headerSubtitle) {
                    headerSubtitle.classList.add('hidden');
                }

                const selectInfo = select.querySelector('.select__info');
                if (selectInfo) {
                    selectInfo.style.display = 'block';
                }
            }
        });
    }
});

slides.forEach((slide, slideIndex) => {
    const select = slide.querySelector('.select');
    const dropdownContent = slide.querySelector('.select__dropdown');
    const selectHeader = slide.querySelector('.select__header');
    const headerSubtitle = slide.querySelector('.select__subtitle');
    const headerTitle = selectHeader.querySelector('.select__header-title');
    const dropdownItems = slide.querySelectorAll('.select__item');
    const headerInput = selectHeader.querySelector('.select__header-input');
    const selectInfo = slide.querySelector('.select__info');

    let firstOptionSelected = false;

    selectHeader.addEventListener('click', () => {
        if (dropdownContent) {
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
                select.classList.remove('active');
            } else {
                dropdownContent.style.display = 'block';
                select.classList.add('active');
                dotsList.classList.add('active');
            }
        }

        if (!isInputVisible[slideIndex]) {
            if (headerInput) {
                headerInput.style.display = 'block';
                headerInput.focus();
                headerTitle.style.display = 'none';
                if (selectInfo) {
                    selectInfo.style.display = 'block';
                }
                headerSubtitle.classList.remove('hidden');
                isInputVisible[slideIndex] = true;
            }
        }
    });

    dropdownItems.forEach((item) => {
        item.addEventListener('click', () => {
            dropdownItems.forEach(item => {
                item.classList.remove('selected');
            });
            item.classList.add('selected');

            if (!firstOptionSelected) {
                firstOptionSelected = true;
                headerSubtitle.classList.remove('hidden');
                select.classList.add('fill');
                selectHeader.style.fontWeight = '400';
            }
            selectHeader.querySelector('.select__header-title').textContent = item.textContent;
            dropdownContent.style.display = 'none';
            select.classList.remove('active');
            dotsList.classList.remove('active');
        });
    });
});

