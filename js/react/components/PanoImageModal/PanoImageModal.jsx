import React from 'react';

import './PanoImageModal.scss';
import panoHTML from './pannellum.htm';

const PanoImageModal = ({ showPano, src, closePano }) => {
    const display = showPano ? 'block' : 'none';

    const iframeSrc = `${panoHTML}?panorama=${src}&autoLoad=true`;
    return (
        <div className="z-pano-modal">
            <iframe className="PanoImageModal__iframe" src={iframeSrc} allowFullScreen style={{ display }} />
            <button
              className="PanoImageModal__close-button"
              onClick={closePano}
              style={{ display }}
            >
                &times;
            </button>
        </div>
    );
};

PanoImageModal.propTypes = {
    closePano: React.PropTypes.func,
    showPano: React.PropTypes.bool,
    src: React.PropTypes.string
};

export default PanoImageModal;
