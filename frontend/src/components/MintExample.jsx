import React from 'react';

const MintExample = () => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 font-poppins">Tailwind v4 Theme Examples</h2>
      
      <div className="space-y-6">
        {/* Mint Color Examples */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Custom Mint Color</h3>
          <div className="flex space-x-4">
            <div className="p-4 bg-mint-500 text-white rounded">
              bg-mint-500 (Tailwind class)
            </div>
            <div className="p-4 mint-bg text-white rounded">
              mint-bg (CSS class)
            </div>
            <div className="p-4 bg-white mint-text rounded border">
              mint-text (CSS class)
            </div>
          </div>
        </div>
        
        {/* Font Examples */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Custom Font</h3>
          <div className="space-y-2">
            <p className="font-poppins text-lg">
              This text uses the Poppins font via Tailwind class (font-poppins)
            </p>
            <p style={{ fontFamily: 'var(--font-poppins)' }}>
              This text uses the Poppins font via CSS variable directly
            </p>
          </div>
        </div>
        
        {/* Button Examples */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Custom Buttons</h3>
          <div className="flex space-x-4">
            <button className="btn-primary">
              Primary Button
            </button>
            <button className="btn-secondary">
              Secondary Button
            </button>
            <button className="btn-mint">
              Mint Button
            </button>
          </div>
        </div>
        
        {/* Card Example */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Hover Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white shadow rounded-lg hover-card">
              <h4 className="font-medium">Hover Card 1</h4>
              <p className="text-gray-600">Hover to see effect</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg hover-card">
              <h4 className="font-medium">Hover Card 2</h4>
              <p className="text-gray-600">Hover to see effect</p>
            </div>
            <div className="p-4 mint-bg text-white rounded-lg hover-card">
              <h4 className="font-medium">Mint Hover Card</h4>
              <p className="text-white/80">Hover to see effect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintExample; 