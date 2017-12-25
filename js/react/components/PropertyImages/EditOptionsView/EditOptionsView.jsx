import React, { PropTypes } from 'react';
import cls from 'classnames';
import Button from '../../Button/Button.jsx';

const EditOptionsView = (props) => {
    const { onAddPhotosClicked, onDeleteRearrangePhotosClicked, onAttachToBookableItemClicked, isSmall, isBookableImage } = props;

    const klass = cls(
        'absolute pa2 pt3  pv5-l w-100 h-100 bg-black-50',
        isSmall ? '' : 'pv4-m'
    );
    const photoKlass = cls('pv2-m column', (isBookableImage ? 'small-6' : 'small-4'));
    const buttonMainKlass = cls('row', { 'pv4-l': !isSmall });

    return (
        <div className={klass}>
            <div className="medium-10 relative column medium-centered ba b--white">
                <div className="absolute top--1 right-2" style={{ width: '48px' }}>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: '30px' }}>
                        <title>camera</title>
                        <path fill="#fff" d="M16 10.001c-4.419 0-8 3.581-8 8s3.581 8 8 8c4.418 0 8-3.582 8-8s-3.582-8-8-8zM20.555 21.906c-2.156 2.516-5.943 2.807-8.459 0.65-2.517-2.156-2.807-5.944-0.65-8.459 2.155-2.517 5.943-2.807 8.459-0.65 2.515 2.155 2.806 5.944 0.65 8.459zM16 14.001c0.276 0 0.5 0.224 0.5 0.5s-0.224 0.5-0.5 0.5c-1.657 0-2.999 1.343-3 2.999v0.002c0 0.275-0.224 0.5-0.5 0.5s-0.5-0.225-0.5-0.5v-0.002c0.001-2.208 1.791-3.999 4-3.999zM29.492 9.042l-4.334-0.723-1.373-3.434c-0.459-1.145-1.553-1.885-2.785-1.885h-10c-1.232 0-2.326 0.74-2.786 1.886l-1.372 3.433-4.333 0.723c-1.454 0.241-2.509 1.485-2.509 2.958v15c0 1.654 1.346 3 3 3h26c1.654 0 3-1.346 3-3v-15c0-1.473-1.055-2.717-2.508-2.958zM30 27c0 0.553-0.447 1-1 1h-26c-0.553 0-1-0.447-1-1v-15c0-0.489 0.354-0.906 0.836-0.986l5.444-0.907 1.791-4.478c0.153-0.379 0.52-0.629 0.929-0.629h10c0.408 0 0.775 0.249 0.928 0.629l1.791 4.478 5.445 0.907c0.482 0.080 0.836 0.497 0.836 0.986v15z" />
                    </svg>
                </div>
                <div className={buttonMainKlass}>
                    <div className={photoKlass} style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <Button
                          className="b--black-0125  white bg-black-10 f5 text-center w-100 hover-bg-white-20 h4"
                          onClick={onAddPhotosClicked}
                          style={{ bgColor: 'rgba(0, 0, 0, 0.1)' }}
                        >
                            Add Photos
                        </Button>

                    </div>
                    <div className={photoKlass} style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <Button
                          className="b--black-0125  white bg-black-10 f5 text-center w-100 hover-bg-white-20 h4"
                          onClick={onDeleteRearrangePhotosClicked}
                          style={{ bgColor: 'rgba(0, 0, 0, 0.1)', borderLeft: '1px solid #fff' }}
                        >
                            Delete or Rearrange
                        </Button>
                    </div>
                    {
                        !isBookableImage &&
                        <div className="small-4 pv2-m column pl0" style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Button
                              className="b--black-0125  white bg-black-10 f5 text-center w-100 hover-bg-white-20 h4"
                              onClick={onAttachToBookableItemClicked}
                              style={{ bgColor: 'rgba(0, 0, 0, 0.1)', borderLeft: '1px solid #fff' }}
                            >
                                Attach to Bookable Items
                            </Button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

EditOptionsView.defaultProps = {
    isBookableImage: false,
    isSmall: false
};

EditOptionsView.propTypes = {
    onAddPhotosClicked: PropTypes.func.isRequired,
    onDeleteRearrangePhotosClicked: PropTypes.func.isRequired,
    onAttachToBookableItemClicked: PropTypes.func.isRequired,
    isBookableImage: PropTypes.bool,
    isSmall: PropTypes.bool
};

export default EditOptionsView;
