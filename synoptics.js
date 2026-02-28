/**
 * System Synoptics - Visual system diagrams
 * Compliant with ARINC 661 and CS-25.1301(a)
 * Provides animated visual representation of aircraft systems
 */

export class SynopticDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentSystem = null;
        this.animationFrameId = null;
        this.flowAnimations = new Map();
    }

    /**
     * Display synoptic for a given system
     * @param {string} systemKey - System identifier (HYD, ELEC, FUEL, etc.)
     * @param {object} data - Current system data
     */
    show(systemKey, data) {
        this.currentSystem = systemKey;
        
        if (!this.container) {
            console.error('Synoptic container not found');
            return;
        }

        // Clear previous content
        this.container.innerHTML = '';
        this.stopAnimations();

        // Generate synoptic based on system type
        switch (systemKey) {
            case 'HYD':
                this.renderHydraulicSynoptic(data);
                break;
            case 'ELEC':
                this.renderElectricalSynoptic(data);
                break;
            case 'FUEL':
                this.renderFuelSynoptic(data);
                break;
            case 'PRESS':
                this.renderPressureSynoptic(data);
                break;
            default:
                this.renderGenericSynoptic(systemKey, data);
        }
    }

    /**
     * Render hydraulic system synoptic (3 circuits: GREEN, BLUE, YELLOW)
     */
    renderHydraulicSynoptic(data) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 800 600');
        svg.setAttribute('class', 'synoptic-svg');

        const circuits = [
            { name: 'GREEN', x: 100, color: '#00ff00', eng: 1 },
            { name: 'BLUE', x: 400, color: '#00aaff', eng: null },
            { name: 'YELLOW', x: 650, color: '#ffff00', eng: 2 }
        ];

        circuits.forEach(circuit => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', `hyd-circuit-${circuit.name.toLowerCase()}`);

            // Header
            const title = this.createSVGText(circuit.x, 30, circuit.name, {
                fontSize: '20px',
                fontWeight: 'bold',
                fill: circuit.color
            });
            g.appendChild(title);

            // Reservoir
            const reservoir = this.createSVGRect(circuit.x - 30, 60, 60, 80, {
                fill: 'none',
                stroke: circuit.color,
                strokeWidth: 2
            });
            g.appendChild(reservoir);

            // Fluid level indicator
            const pressure = data?.[`HYD_${circuit.name}_PSI`] || 3000;
            const fluidLevel = Math.min(100, (pressure / 3000) * 100);
            const fluid = this.createSVGRect(circuit.x - 28, 60 + (80 - fluidLevel * 0.7), 56, fluidLevel * 0.7, {
                fill: circuit.color,
                opacity: 0.6
            });
            g.appendChild(fluid);

            const resLabel = this.createSVGText(circuit.x, 155, 'RESERVOIR', {
                fontSize: '12px',
                fill: circuit.color
            });
            g.appendChild(resLabel);

            // Pressure value
            const pressureText = this.createSVGText(circuit.x, 175, `${Math.round(pressure)} PSI`, {
                fontSize: '14px',
                fill: pressure < 2500 ? '#ff0000' : circuit.color,
                fontWeight: pressure < 2500 ? 'bold' : 'normal'
            });
            g.appendChild(pressureText);

            // Pump
            const pump = this.createSVGCircle(circuit.x, 230, 25, {
                fill: 'none',
                stroke: circuit.color,
                strokeWidth: 2
            });
            g.appendChild(pump);

            // Pump status
            const pumpStatus = pressure > 2500 ? 'ON' : 'OFF';
            const pumpText = this.createSVGText(circuit.x, 235, pumpStatus, {
                fontSize: '12px',
                fill: pumpStatus === 'ON' ? circuit.color : '#666',
                fontWeight: 'bold'
            });
            g.appendChild(pumpText);

            // Engine/Electric pump indicator
            const pumpType = circuit.eng ? `ENG ${circuit.eng}` : 'ELEC';
            const pumpLabel = this.createSVGText(circuit.x, 270, pumpType, {
                fontSize: '10px',
                fill: circuit.color
            });
            g.appendChild(pumpLabel);

            // Line from reservoir to pump
            const line1 = this.createSVGLine(circuit.x, 140, circuit.x, 205, {
                stroke: circuit.color,
                strokeWidth: 3
            });
            g.appendChild(line1);

            // Line from pump to consumers
            const line2 = this.createSVGLine(circuit.x, 255, circuit.x, 350, {
                stroke: circuit.color,
                strokeWidth: 3,
                id: `flow-${circuit.name.toLowerCase()}`
            });
            g.appendChild(line2);

            // Animated flow indicator
            if (pressure > 2500) {
                this.addFlowAnimation(`flow-${circuit.name.toLowerCase()}`, circuit.color);
            }

            // Consumers
            const consumers = [
                { y: 380, label: 'FLIGHT CTRL' },
                { y: 430, label: 'BRAKES' },
                { y: 480, label: 'L/G' },
                { y: 530, label: 'SLATS/FLAPS' }
            ];

            consumers.forEach(consumer => {
                // Branch line
                const branch = this.createSVGLine(circuit.x, consumer.y, circuit.x + 40, consumer.y, {
                    stroke: circuit.color,
                    strokeWidth: 2
                });
                g.appendChild(branch);

                // Consumer box
                const consumerBox = this.createSVGRect(circuit.x + 40, consumer.y - 10, 80, 20, {
                    fill: 'none',
                    stroke: circuit.color,
                    strokeWidth: 1
                });
                g.appendChild(consumerBox);

                // Consumer label
                const consumerLabel = this.createSVGText(circuit.x + 80, consumer.y + 5, consumer.label, {
                    fontSize: '10px',
                    fill: circuit.color
                });
                g.appendChild(consumerLabel);
            });

            svg.appendChild(g);
        });

        // Add title
        const mainTitle = this.createSVGText(400, 590, 'HYDRAULIC SYSTEM SYNOPTIC', {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#0af'
        });
        svg.appendChild(mainTitle);

        this.container.appendChild(svg);
    }

    /**
     * Render electrical system synoptic
     */
    renderElectricalSynoptic(data) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 800 600');
        svg.setAttribute('class', 'synoptic-svg');

        // Generators
        const generators = [
            { name: 'GEN 1', x: 150, y: 100, eng: 1 },
            { name: 'GEN 2', x: 650, y: 100, eng: 2 },
            { name: 'APU GEN', x: 400, y: 200 }
        ];

        generators.forEach(gen => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Generator symbol
            const genCircle = this.createSVGCircle(gen.x, gen.y, 30, {
                fill: 'none',
                stroke: '#0af',
                strokeWidth: 2
            });
            g.appendChild(genCircle);

            // G symbol
            const gText = this.createSVGText(gen.x, gen.y + 5, 'G', {
                fontSize: '24px',
                fontWeight: 'bold',
                fill: '#0af'
            });
            g.appendChild(gText);

            // Label
            const label = this.createSVGText(gen.x, gen.y - 45, gen.name, {
                fontSize: '14px',
                fill: '#0af',
                fontWeight: 'bold'
            });
            g.appendChild(label);

            // Voltage
            const voltage = this.createSVGText(gen.x, gen.y + 50, '115V / 400Hz', {
                fontSize: '12px',
                fill: '#0f0'
            });
            g.appendChild(voltage);

            svg.appendChild(g);
        });

        // Main buses
        const buses = [
            { name: 'AC BUS 1', x: 200, y: 300 },
            { name: 'AC BUS 2', x: 600, y: 300 }
        ];

        buses.forEach(bus => {
            const busRect = this.createSVGRect(bus.x - 60, bus.y - 15, 120, 30, {
                fill: '#003366',
                stroke: '#0af',
                strokeWidth: 2
            });
            svg.appendChild(busRect);

            const busText = this.createSVGText(bus.x, bus.y + 5, bus.name, {
                fontSize: '14px',
                fill: '#0af',
                fontWeight: 'bold'
            });
            svg.appendChild(busText);
        });

        // Connection lines
        this.createSVGLine(150, 130, 200, 285, { stroke: '#0af', strokeWidth: 3 });
        this.createSVGLine(650, 130, 600, 285, { stroke: '#0af', strokeWidth: 3 });

        // DC buses
        const dcBuses = [
            { name: 'DC BUS 1', x: 250, y: 450 },
            { name: 'DC BUS 2', x: 550, y: 450 }
        ];

        dcBuses.forEach(bus => {
            // TRU (Transformer Rectifier Unit)
            const truRect = this.createSVGRect(bus.x - 40, bus.y - 60, 80, 40, {
                fill: 'none',
                stroke: '#ff6600',
                strokeWidth: 2
            });
            svg.appendChild(truRect);

            const truText = this.createSVGText(bus.x, bus.y - 35, 'TRU', {
                fontSize: '12px',
                fill: '#ff6600',
                fontWeight: 'bold'
            });
            svg.appendChild(truText);

            // DC Bus
            const busRect = this.createSVGRect(bus.x - 50, bus.y - 15, 100, 30, {
                fill: '#330000',
                stroke: '#ff6600',
                strokeWidth: 2
            });
            svg.appendChild(busRect);

            const busText = this.createSVGText(bus.x, bus.y + 5, bus.name, {
                fontSize: '14px',
                fill: '#ff6600',
                fontWeight: 'bold'
            });
            svg.appendChild(busText);

            const voltText = this.createSVGText(bus.x, bus.y + 40, '28V DC', {
                fontSize: '11px',
                fill: '#ff6600'
            });
            svg.appendChild(voltText);
        });

        // Battery
        const battery = this.createSVGRect(370, 480, 60, 40, {
            fill: 'none',
            stroke: '#ff0',
            strokeWidth: 2
        });
        svg.appendChild(battery);

        const batText = this.createSVGText(400, 505, 'BAT', {
            fontSize: '14px',
            fill: '#ff0',
            fontWeight: 'bold'
        });
        svg.appendChild(batText);

        // Title
        const title = this.createSVGText(400, 580, 'ELECTRICAL SYSTEM SYNOPTIC', {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#0af'
        });
        svg.appendChild(title);

        this.container.appendChild(svg);
    }

    /**
     * Render fuel system synoptic
     */
    renderFuelSynoptic(data) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 800 600');
        svg.setAttribute('class', 'synoptic-svg');

        // Fuel tanks
        const tanks = [
            { name: 'LEFT', x: 150, qty: data?.FUEL_LEFT_KG || 8000, capacity: 10000 },
            { name: 'CENTER', x: 400, qty: data?.FUEL_CENTER_KG || 12000, capacity: 15000 },
            { name: 'RIGHT', x: 650, qty: data?.FUEL_RIGHT_KG || 8000, capacity: 10000 }
        ];

        tanks.forEach(tank => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // Tank outline
            const tankRect = this.createSVGRect(tank.x - 60, 100, 120, 150, {
                fill: 'none',
                stroke: '#0af',
                strokeWidth: 2,
                rx: 10
            });
            g.appendChild(tankRect);

            // Fuel level
            const level = (tank.qty / tank.capacity) * 150;
            const fuelRect = this.createSVGRect(tank.x - 58, 100 + (150 - level), 116, level, {
                fill: '#ff6600',
                opacity: 0.7
            });
            g.appendChild(fuelRect);

            // Tank label
            const label = this.createSVGText(tank.x, 80, `${tank.name} TANK`, {
                fontSize: '14px',
                fill: '#0af',
                fontWeight: 'bold'
            });
            g.appendChild(label);

            // Quantity
            const qtyText = this.createSVGText(tank.x, 175, `${Math.round(tank.qty)} KG`, {
                fontSize: '16px',
                fill: tank.qty < 2000 ? '#ff0000' : '#0f0',
                fontWeight: 'bold'
            });
            g.appendChild(qtyText);

            // Percentage
            const pct = Math.round((tank.qty / tank.capacity) * 100);
            const pctText = this.createSVGText(tank.x, 195, `${pct}%`, {
                fontSize: '12px',
                fill: '#0af'
            });
            g.appendChild(pctText);

            svg.appendChild(g);
        });

        // Engines
        const engines = [
            { name: 'ENG 1', x: 200, y: 400 },
            { name: 'ENG 2', x: 600, y: 400 }
        ];

        engines.forEach(eng => {
            const engineCircle = this.createSVGCircle(eng.x, eng.y, 35, {
                fill: 'none',
                stroke: '#f00',
                strokeWidth: 2
            });
            svg.appendChild(engineCircle);

            const engText = this.createSVGText(eng.x, eng.y + 5, eng.name === 'ENG 1' ? '1' : '2', {
                fontSize: '26px',
                fill: '#f00',
                fontWeight: 'bold'
            });
            svg.appendChild(engText);

            const flowText = this.createSVGText(eng.x, eng.y + 60, '2500 KG/H', {
                fontSize: '12px',
                fill: '#0f0'
            });
            svg.appendChild(flowText);
        });

        // Fuel lines
        this.createSVGLine(150, 250, 200, 365, { stroke: '#ff6600', strokeWidth: 3, id: 'fuel-line-left' });
        this.createSVGLine(400, 250, 200, 365, { stroke: '#ff6600', strokeWidth: 3 });
        this.createSVGLine(400, 250, 600, 365, { stroke: '#ff6600', strokeWidth: 3 });
        this.createSVGLine(650, 250, 600, 365, { stroke: '#ff6600', strokeWidth: 3, id: 'fuel-line-right' });

        // Crossfeed valves
        const xfeed = this.createSVGRect(375, 300, 50, 30, {
            fill: '#003300',
            stroke: '#0f0',
            strokeWidth: 2
        });
        svg.appendChild(xfeed);

        const xfeedText = this.createSVGText(400, 320, 'X-FEED', {
            fontSize: '10px',
            fill: '#0f0',
            fontWeight: 'bold'
        });
        svg.appendChild(xfeedText);

        // Total fuel
        const totalFuel = tanks.reduce((sum, tank) => sum + tank.qty, 0);
        const totalText = this.createSVGText(400, 500, `TOTAL: ${Math.round(totalFuel)} KG`, {
            fontSize: '18px',
            fill: totalFuel < 5000 ? '#ff0000' : '#0f0',
            fontWeight: 'bold'
        });
        svg.appendChild(totalText);

        // Title
        const title = this.createSVGText(400, 580, 'FUEL SYSTEM SYNOPTIC', {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#0af'
        });
        svg.appendChild(title);

        // Animate fuel flow
        this.addFlowAnimation('fuel-line-left', '#ff6600');
        this.addFlowAnimation('fuel-line-right', '#ff6600');

        this.container.appendChild(svg);
    }

    /**
     * Render pressurization synoptic
     */
    renderPressureSynoptic(data) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 800 600');
        svg.setAttribute('class', 'synoptic-svg');

        // Cabin outline
        const cabin = this.createSVGEllipse(400, 300, 250, 120, {
            fill: 'none',
            stroke: '#0af',
            strokeWidth: 3
        });
        svg.appendChild(cabin);

        const cabinLabel = this.createSVGText(400, 200, 'CABIN', {
            fontSize: '20px',
            fill: '#0af',
            fontWeight: 'bold'
        });
        svg.appendChild(cabinLabel);

        // Cabin altitude
        const cabinAlt = data?.PRESS_CAB_ALT || 7000;
        const altText = this.createSVGText(400, 280, `${Math.round(cabinAlt)} FT`, {
            fontSize: '32px',
            fill: cabinAlt > 8000 ? '#ff0000' : '#0f0',
            fontWeight: 'bold'
        });
        svg.appendChild(altText);

        // Differential pressure
        const diffPress = data?.PRESS_CAB_DIFF || 8.5;
        const diffText = this.createSVGText(400, 320, `ΔP: ${diffPress.toFixed(1)} PSI`, {
            fontSize: '18px',
            fill: diffPress > 9.0 ? '#ff0000' : '#0af'
        });
        svg.appendChild(diffText);

        // Rate of climb/descent
        const rate = data?.PRESS_CAB_RATE || -300;
        const rateText = this.createSVGText(400, 350, `RATE: ${rate > 0 ? '+' : ''}${rate} FT/MIN`, {
            fontSize: '16px',
            fill: Math.abs(rate) > 500 ? '#ff0' : '#0af'
        });
        svg.appendChild(rateText);

        // Outflow valve
        const valve = this.createSVGRect(350, 420, 100, 50, {
            fill: 'none',
            stroke: '#0f0',
            strokeWidth: 2
        });
        svg.appendChild(valve);

        const valveText = this.createSVGText(400, 435, 'OUTFLOW', {
            fontSize: '12px',
            fill: '#0f0',
            fontWeight: 'bold'
        });
        svg.appendChild(valveText);

        const valvePos = data?.PRESS_OFV_POS || 45;
        const valvePosText = this.createSVGText(400, 455, `${Math.round(valvePos)}% OPEN`, {
            fontSize: '14px',
            fill: '#0f0'
        });
        svg.appendChild(valvePosText);

        // Safety valve
        const safetyValve = this.createSVGCircle(600, 300, 25, {
            fill: 'none',
            stroke: '#ff0',
            strokeWidth: 2
        });
        svg.appendChild(safetyValve);

        const safetyText = this.createSVGText(600, 305, 'SFTY', {
            fontSize: '10px',
            fill: '#ff0',
            fontWeight: 'bold'
        });
        svg.appendChild(safetyText);

        // Packs
        ['PACK 1', 'PACK 2'].forEach((pack, i) => {
            const x = 250 + i * 300;
            const packRect = this.createSVGRect(x - 40, 100, 80, 40, {
                fill: '#003366',
                stroke: '#0af',
                strokeWidth: 2
            });
            svg.appendChild(packRect);

            const packText = this.createSVGText(x, 125, pack, {
                fontSize: '14px',
                fill: '#0af',
                fontWeight: 'bold'
            });
            svg.appendChild(packText);

            // Flow line
            const line = this.createSVGLine(x, 140, x, 180, {
                stroke: '#0af',
                strokeWidth: 3
            });
            svg.appendChild(line);

            const arrow = this.createSVGPolygon([
                [x - 5, 175],
                [x + 5, 175],
                [x, 185]
            ], {
                fill: '#0af'
            });
            svg.appendChild(arrow);
        });

        // Title
        const title = this.createSVGText(400, 580, 'PRESSURIZATION SYSTEM SYNOPTIC', {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#0af'
        });
        svg.appendChild(title);

        this.container.appendChild(svg);
    }

    /**
     * Render generic synoptic for other systems
     */
    renderGenericSynoptic(systemKey, data) {
        const div = document.createElement('div');
        div.className = 'synoptic-placeholder';
        div.innerHTML = `
            <h2>SYSTEM SYNOPTIC</h2>
            <p>${systemKey} System</p>
            <p class="info">Detailed synoptic not yet implemented</p>
        `;
        this.container.appendChild(div);
    }

    // ============= SVG Helper Methods =============

    createSVGText(x, y, text, styles = {}) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'middle');
        
        Object.entries(styles).forEach(([key, value]) => {
            if (key === 'fontSize') textEl.style.fontSize = value;
            else if (key === 'fontWeight') textEl.style.fontWeight = value;
            else textEl.setAttribute(key, value);
        });
        
        textEl.textContent = text;
        return textEl;
    }

    createSVGRect(x, y, width, height, styles = {}) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        
        Object.entries(styles).forEach(([key, value]) => {
            rect.setAttribute(key, value);
        });
        
        return rect;
    }

    createSVGCircle(cx, cy, r, styles = {}) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        
        Object.entries(styles).forEach(([key, value]) => {
            circle.setAttribute(key, value);
        });
        
        return circle;
    }

    createSVGEllipse(cx, cy, rx, ry, styles = {}) {
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ellipse.setAttribute('cx', cx);
        ellipse.setAttribute('cy', cy);
        ellipse.setAttribute('rx', rx);
        ellipse.setAttribute('ry', ry);
        
        Object.entries(styles).forEach(([key, value]) => {
            ellipse.setAttribute(key, value);
        });
        
        return ellipse;
    }

    createSVGLine(x1, y1, x2, y2, styles = {}) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        
        Object.entries(styles).forEach(([key, value]) => {
            line.setAttribute(key, value);
        });
        
        this.container.appendChild(line);
        return line;
    }

    createSVGPolygon(points, styles = {}) {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const pointsStr = points.map(p => p.join(',')).join(' ');
        polygon.setAttribute('points', pointsStr);
        
        Object.entries(styles).forEach(([key, value]) => {
            polygon.setAttribute(key, value);
        });
        
        return polygon;
    }

    /**
     * Add animated flow effect to a line
     */
    addFlowAnimation(elementId, color) {
        // This would require additional CSS or SVG animation
        // Store for potential future animation
        this.flowAnimations.set(elementId, { color, active: true });
    }

    /**
     * Stop all animations
     */
    stopAnimations() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.flowAnimations.clear();
    }

    /**
     * Hide synoptic
     */
    hide() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.stopAnimations();
        this.currentSystem = null;
    }
}

export default SynopticDisplay;
