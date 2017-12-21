/**
 * Show a preview of the file uploaded via the `input`, in the image
 * element.
 *
 * @param input The file input element.
 * @param previewEl Element where the preview would be show.
 */
export default ({ input, previewEl }) => {
    const file = input.files && input.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        previewEl.setAttribute('src', e.target.result);
    };

    reader.readAsDataURL(file);
};
