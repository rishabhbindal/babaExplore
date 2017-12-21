import React from 'react';
import { Link } from 'react-router-dom';

import vikramImg from '../../../../images/vikram.png';
import rohitImg from '../../../../images/rohit.png';
import startHouseImg from '../../../../images/startup_house.jpg';
import linkedinImg from '../../../../images/linkedin.png';

const AboutPage = () => (
    <main>
        <div>
            <article className="center pa4 w-two-thirds-ns">
                <section>
                    <h1>About Us</h1>
                    <hr />
                </section>
                <section>
                    <div>
                    <h4>Vikram (Founder/CEO)</h4>
                    <img
                      src={vikramImg}
                      alt="Vikram (Founder/CEO)"
                      className="mb2 mb4-ns ml3-ns fr-ns"
                    />
                    <p>Welcome to ExploreLifeTraveling, where we help blur the human boundaries by providing a platform for folks to rent accommodations from trusted local hosts.
                        <br />
                        In my previous life, I worked as a software architect after my graduation from University of Texas at Austin with M.S in Computer Science. My love for travel led me to more than 10 countries and a plethora of experiences.
                        <br />
                        Like the quote goes "Life is a mystery to be lived, not a problem to be solved", I believe that understanding the mysteries of life is best done through traveling and there's no better way to travel than to see the world from the eyes of the locals, understand their culture and indulge in their food. My goal is to embody this philosophy in all parts of the company starting from our <Link to="/listing/explore">Startup house</Link> to every part of our website. As for formal education and qualification, here's my linkedin&nbsp;
                        <a
                          className="linkedin-icon"
                          href="https://www.linkedin.com/in/vikrampkumar"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                            <img src={linkedinImg} alt="Vikram's LinkedIn profile link" />
                        </a>
                    </p>
                    </div>
                    <br />
                    <a
                      className="image"
                      href="https://www.explorelifetraveling.com/listing/explore"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                        <img src={startHouseImg} />
                    </a>
                    <br />
                    <br />
                    <br />
                    <div>
                    <h4>Rohit (Founder/CTO)</h4>
                    <img
                      src={rohitImg}
                      alt="Rohit (Founder/CTO)"
                      className="mb2 mb4-ns mr3-ns fl-ns"
                    />
                    <p>With my 20 years of experience in enterprise software and 20 patents later. I decided to bring my software skills to the consumer market.Being a family man with a wife and two children, I was tired of overpriced packaged vacations where a family could not truly enjoy the culture of the place they visited. I craved for a system which would provide a safe space yet enable fun and cultural immersion associated with traveling and exploring. On not finding any such solutions and being an engineer i got right back to tinkering and cofounded Explore Life Traveling. As for my formal education and qualification, here is my linkedin&nbsp;
                        <a
                          className="linkedin-icon"
                          href="https://www.linkedin.com/in/rohitksuri"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                            <img src={linkedinImg} alt="Rohit's LinkedIn profile link" />
                        </a>
                    </p>
                    </div>
                    <div className="cb" />
                </section>
            </article>
        </div>
    </main>
);

export default AboutPage;
