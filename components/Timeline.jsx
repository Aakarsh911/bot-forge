import React, { useEffect, useRef } from 'react';
import '../css/Timeline.css';

const Timeline = () => {
  const timelineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timelineRef.current.classList.add('visible');
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => {
      if (timelineRef.current) {
        observer.unobserve(timelineRef.current);
      }
    };
  }, []);

  return (
    <div className="timeline-wrapper" ref={timelineRef}>
      <div className="timeline-line"></div>
      <div className="timeline-points">
        <div className="timeline-point">
          <div className="timeline-point-circle"></div>
          <div className="timeline-point-text">
            <h3>Write a prompt</h3>
            <p>Define how your chatbot starts a conversation.</p>
          </div>
        </div>
        <div className="timeline-point">
          <div className="timeline-point-circle"></div>
          <div className="timeline-point-text">
            <h3>Set the appearance</h3>
            <p>Customize the look and feel of your bot.</p>
          </div>
        </div>
        <div className="timeline-point">
          <div className="timeline-point-circle"></div>
          <div className="timeline-point-text">
            <h3>Set the API Config (Optional)</h3>
            <p>Configure API endpoints to extend bot functionality.</p>
          </div>
        </div>
        <div className="timeline-point">
          <div className="timeline-point-circle"></div>
          <div className="timeline-point-text">
            <h3>Integrate in your website</h3>
            <p>Embed the bot and start using it immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
