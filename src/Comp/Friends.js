import React from 'react';

function Friends() {
    return (
        <div className="main-container bg-black h-screen overflow-auto">
            <div className="container">
                <div className="row justify-content-center align-items-center">
                    <div className="use-position"><i className="fas fa-arrow-left text-white text-2xl"></i></div>
                    <div className="col-lg-12">
                        <h1 className="text-white text-center mt-4">Friend Zone</h1>
                    </div>
                    <div className="row">
                        <span className="d-flex flex-row-reverse" style={{ marginLeft: '-60px', marginTop: '-25px' }}>
                            <span data-toggle="tooltip" title="Click for more options">
                                <ul className="list-unstyled">
                                    <li className="nav-item dropdown">
                                        <a className="nav-link" href="#" id="navbarDropdownMenuLink" role="button"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fas fa-ellipsis-vertical text-white"></i>
                                        </a>
                                        <ul className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                            <li><a className="dropdown-item mb-3" href="#"><i className="fas fa-share"
                                                style={{ paddingRight: '10px' }}></i>Add bot</a></li>
                                            <li><a className="dropdown-item" href="#"><i className="fas fa-cog"
                                                style={{ paddingRight: '10px' }}></i>Reload page</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </span>
                        </span>
                    </div>
                    <div className="col-lg-12">
                        <p className="text-white mt-3" style={{ color: 'rgba(248, 187, 36, 1) !important' }}>Invite friends to get a bonus</p>
                    </div>
                    <div className="col-lg-12">
                        <div className="col-lg-6 d-flex align-items-center p-3 mt-3"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '20px' }}>
                            <img src="Images/Coin.svg" className="img-fluid" width="10%" height="10%" alt="" />
                            <div className="ms-3">
                                <p className="text-white mb-0" style={{ fontSize: '12px' }}>Invite friend</p>
                                <div className="d-flex align-items-center">
                                    <img src="Images/image 14.svg" alt="Image" className="img-fluid me-1" />
                                    <p className="text-white mb-0" style={{ fontSize: '12px' }}>50,000 <span
                                        className="text-white">For you and fren</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-12 mt-4">
                        <h2 className="text-white">Friends List</h2>
                    </div>
                    <div className="col-lg-12 d-flex justify-content-center align-items-center flex-column mt-3"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', overflowY: 'auto', height: '400px' }}>
                        <div className="mt-5">
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                            <div className="p-2">
                                <img src="Images/frenst list.svg" className="img-fluid" alt="" />
                            </div>
                        </div>
                        <div className="p-3 position-absolute" style={{ bottom: '81px', left: '50%' }}>
                            <button className="share-referral btn px-5 py-3 border-none" style={{ width: '200px', height: '50px', whiteSpace: 'normal' }}>Share referral code</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Friends;
