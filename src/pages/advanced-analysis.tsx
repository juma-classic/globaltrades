import React from 'react';
import './advanced-analysis.scss';

const AdvancedAnalysis: React.FC = () => {
    return (
        <div className="advanced-analysis-container">
            <div className="advanced-analysis-header">
                <h1>Advanced Analysis</h1>
                <p>Powered by Bot Analysis Tool</p>
            </div>
            <div className="advanced-analysis-iframe-wrapper">
                <iframe
                    src="https://bot-analysis-tool-belex.web.app"
                    title="Advanced Analysis Tool"
                    className="advanced-analysis-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default AdvancedAnalysis;
