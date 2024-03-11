import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import coin from '../assets/Coin.svg';
import victory from '../assets/victoryIcon.svg';
import coins from '../assets/coins.svg';
import gifticon from '../assets/giftIcon.svg';
import Twitter from '../assets/xtwitter.svg';
import telegram from '../assets/telegram.svg';
import '../App.css';

function Dashboard() {
    const [counterValue, setCounterValue] = useState(17);
    const [numbersValue, setNumbersValue] = useState(992);
    const [tapCount, setTapCount] = useState(0);
    const [totalTime, setTotalTime] = useState({ days: 55, hours: 2, minutes: 45 });
    const [clicked, setClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // State to manage the initial loading

    useEffect(() => {
        const interval = setInterval(() => {
            updateTotalTime();
        }, 1000); // Update total time every second

        // Simulating an asynchronous operation like fetching data
        setTimeout(() => {
            setIsLoading(false); // Set isLoading to false after 2 seconds (simulating data fetching)
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (tapCount === 2) {
            setCounterValue(counterValue + 1);
            setTapCount(0);
        }

        if (tapCount === 2 && numbersValue > 0) {
            setNumbersValue(numbersValue - 1);
        }
    }, [tapCount, counterValue, numbersValue]);

    const updateTotalTime = () => {
        let totalMinutes = totalTime.days * 24 * 60 + totalTime.hours * 60 + totalTime.minutes;
        totalMinutes -= 1;
        if (totalMinutes < 0) totalMinutes = 0;

        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;

        setTotalTime({ days, hours, minutes });
    };

    const handleCoinClick = () => {
        setTapCount(tapCount + 1);
        setClicked(true);

        setTimeout(() => {
            setClicked(false);
        }, 1000); // Reset animation after 1 second
    };

    return (
        <main className="bg-gray-900 min-h-screen flex justify-center items-center">
            {isLoading ? ( // Display loader only if isLoading is true
                <div className="loader">
                    <div className="circle">
                        <div className="dot"></div>
                        <div className="outline"></div>
                    </div>
                    <div className="circle">
                        <div className="dot"></div>
                        <div className="outline"></div>
                    </div>
                    <div className="circle">
                        <div className="dot"></div>
                        <div className="outline"></div>
                    </div>
                    <div className="circle">
                        <div className="dot"></div>
                        <div className="outline"></div>
                    </div>
                </div>
            ) : (
                // Render the Dashboard content when isLoading is false
                <div className="container mx-auto text-center text-white">
                    <div className="flex justify-end mt-5">
                        <div className="relative">
                            <button className="focus:outline-none" aria-label="More options">
                                <i className="fas fa-ellipsis-v text-2xl"></i>
                            </button>
                            <div className="absolute right-0 mt-3 w-36 bg-gray-800 rounded-lg shadow-lg py-2">
                                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Add bot</Link>
                                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Reload page</Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center items-center mt-6">
                        <button className="focus:outline-none">
                            <img src={`${coins}`} width="40" height="40" alt="Coin" />
                        </button>
                        <span className={`text-2xl font-bold ${clicked ? 'animate-bounce' : ''}`}>{counterValue}</span>
                    </div>
                    <div className="mt-4">
                        <span>Claim your tokens in:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-3xl">
                        <div>
                            <span className="font-bold">{totalTime.days}</span> <span>DAYS</span>
                        </div>
                        <div>
                            <span className="font-bold">{totalTime.hours}</span> <span>HOURS</span>
                        </div>
                        <div>
                            <span className="font-bold">{totalTime.minutes}</span> <span>MINUTES</span>
                        </div>
                    </div>
                    <div className="mt-5 relative">
                        <span className={`element-1 ${clicked ? 'animate-element' : 'hidden'}`} style={{ display: clicked ? 'block' : 'none', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>1</span>
                        <img src={`${coin}`} className="inline-block" alt="Coin" onClick={handleCoinClick} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <div className="text-center">
                            <img src={`${victory}`} className="inline-block" alt="Victory Icon" />
                            <span>{numbersValue} / 1000</span>
                        </div>
                        <div className="bg-gray-800 rounded-lg py-4 px-8 flex justify-center items-center">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Link to="#" className="text-white">
                                        <img src={`${gifticon}`} className="inline-block" alt="Gift Icon" />
                                        <br />
                                        <span>Friends</span>
                                    </Link>
                                </div>
                                <div>
                                    <Link to="https://x.com/yescoinairdrop?t=Crc2e5ZJx-newsAcIvbj4w&s=09" className="text-white" target="_blank" rel="noopener noreferrer">
                                        <img src={`${Twitter}`} className="inline-block" alt="Twitter Icon" />
                                        <br />
                                        <span>X.com</span>
                                    </Link>
                                </div>
                                <div>
                                    <a href="https://t.me/yescoinairdrop" target="_blank" rel="noopener noreferrer" className="text-white">
                                        <img src={`${telegram}`} className="inline-block" alt="Telegram Icon" />
                                        <br />
                                        <span>Joins</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="outerSide">
                        <span className="inner"></span>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Dashboard;
