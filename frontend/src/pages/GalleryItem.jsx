import { useState, useEffect } from 'react'
const GalleryItem = ({ handleSelectArt, handleUnselectArt, Image, Index, selected }) => {
    const [isSelected, setIsSelected] = useState(selected)

    useEffect(() => {
        setIsSelected(selected)
    }, [selected])

    console.log(Image, "image in art")
    const selectDecision = () => {
        if (selected) {
            handleUnselectArt(Index)
        }
        else {
            handleSelectArt(Index)
        }
    }
    const [showIcon, setshowIcon] = useState(false)
    const [showSocialIcons, setshowSocialIcons] = useState(false)
    return (
        <div
            onMouseEnter={() => setshowIcon(true)}
            onMouseLeave={() => { setshowIcon(false), setshowSocialIcons(false) }}
            className='art-img-div'>
            {showIcon &&
                <span onClick={() => setshowSocialIcons(!showSocialIcons)} className='show-social-icon-btn'>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="18" r="18" fill="#7F7E7E" />
                        <path d="M19.5324 23.8685C17.615 22.7393 15.6631 21.6218 13.7419 20.4926C13.5079 20.3559 13.4159 20.52 13.2855 20.6215C12.8541 20.9665 12.3444 21.1952 11.8034 21.2866C11.2624 21.378 10.7075 21.3293 10.1899 21.1448C9.67224 20.9603 9.20851 20.646 8.84142 20.2309C8.47434 19.8158 8.2157 19.3132 8.08935 18.7695C7.93586 18.115 7.98089 17.4285 8.21848 16.8006C8.45607 16.1727 8.87504 15.6331 9.42003 15.253C9.96773 14.8617 10.6223 14.6557 11.2912 14.6641C11.96 14.6725 12.6094 14.8949 13.1475 15.2998C13.2661 15.4163 13.4224 15.4846 13.587 15.4918C13.7515 15.499 13.913 15.4446 14.041 15.3389C15.8587 14.2566 17.6917 13.2016 19.5133 12.1428C19.379 9.96251 20.2112 8.55589 21.9023 8.10655C22.6327 7.91407 23.4059 7.98382 24.0918 8.30405C24.7777 8.62428 25.3343 9.17546 25.6681 9.86483C25.9915 10.5496 26.0781 11.3257 25.9138 12.067C25.7494 12.8083 25.3439 13.4712 24.7631 13.9479C24.11 14.4631 23.2927 14.7135 22.4691 14.6508C21.6454 14.588 20.8738 14.2165 20.3032 13.608L14.436 17.0151C14.4888 17.3358 14.5233 17.6594 14.5395 17.9841C14.5235 18.3232 14.489 18.661 14.436 18.9961L20.3109 22.3955C20.6706 22.0054 21.1163 21.7081 21.611 21.528C22.1058 21.348 22.6354 21.2904 23.1563 21.36C23.8609 21.444 24.5166 21.7691 25.0162 22.2821C25.5554 22.819 25.8958 23.5294 25.9797 24.2928C26.0636 25.0562 25.8858 25.8257 25.4764 26.4707C25.0691 27.1174 24.4546 27.6004 23.7373 27.8376C23.02 28.0748 22.2442 28.0516 21.5419 27.7719C20.0348 27.178 19.2448 25.6619 19.5324 23.8685Z" fill="white" />
                    </svg>
                </span>
            }
            <span onClick={selectDecision} className='select-art-btn'>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="18" fill={`${selected ? "#B600D1" : "#7F7E7E"}`} fill-opacity="0.5" />
                    <path d="M16.29 22.9999C16.1452 23.0021 16.0014 22.9743 15.8676 22.918C15.7337 22.8617 15.6125 22.7781 15.5113 22.6724L11.3176 18.4016C11.114 18.1894 11 17.9043 11 17.6074C11 17.3105 11.114 17.0254 11.3176 16.8131C11.4197 16.7087 11.5411 16.6258 11.6747 16.5692C11.8083 16.5126 11.9516 16.4835 12.0962 16.4835C12.2409 16.4835 12.3841 16.5126 12.5177 16.5692C12.6514 16.6258 12.7727 16.7087 12.8749 16.8131L16.29 20.2967L23.1201 13.3296C23.2223 13.2251 23.3437 13.1422 23.4773 13.0857C23.6109 13.0291 23.7541 13 23.8988 13C24.0434 13 24.1867 13.0291 24.3203 13.0857C24.4539 13.1422 24.5753 13.2251 24.6774 13.3296C24.7797 13.4332 24.8608 13.5564 24.9161 13.6921C24.9715 13.8279 25 13.9734 25 14.1204C25 14.2674 24.9715 14.4129 24.9161 14.5486C24.8608 14.6843 24.7797 14.8075 24.6774 14.9111L17.0754 22.6655C16.9731 22.772 16.8508 22.8564 16.7159 22.9139C16.581 22.9713 16.4362 23.0006 16.29 22.9999Z" fill="white" />
                </svg>
            </span>
            {isSelected &&
                <div className='selected-tint-art'></div>
            }
            {
                showIcon && showSocialIcons &&
                <div className='social-links-for-art'>
                    <a href="">Instagram</a>
                    <a href="">Twitter</a>
                    <a href="">Facebook</a>
                </div>

            }
            <img src={Image} alt="" />
        </div>
    )
}

export default GalleryItem