import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

async function loadPartials() {
    const includeElements = document.querySelectorAll('[data-include]');
    const promises = [];
    includeElements.forEach(el => {
        const filePath = el.dataset.include;
        promises.push(
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Could not load partial: ${filePath}`);
                    }
                    return response.text();
                })
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    
                    if (tempDiv.children.length === 1 && (tempDiv.firstElementChild.tagName === 'HEADER' || tempDiv.firstElementChild.tagName === 'FOOTER' || tempDiv.firstElementChild.tagName === 'SECTION')) {
                        el.replaceWith(tempDiv.firstElementChild);
                    } else {
                        el.replaceWith(...tempDiv.childNodes);
                    }
                })
                .catch(error => console.error('Error loading partial:', error))
        );
    });
    await Promise.all(promises);
}

function initializeParticleCursor() {
    const particleCanvas = document.createElement('canvas');
    document.body.appendChild(particleCanvas);
    const ctx = particleCanvas.getContext('2d');
    
    particleCanvas.style.position = 'fixed';
    particleCanvas.style.top = '0';
    particleCanvas.style.left = '0';
    particleCanvas.style.width = '100vw';
    particleCanvas.style.height = '100vh';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '9999'; // High z-index to be on top

    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const rootStyles = getComputedStyle(document.documentElement);
    const accentColorRGB = rootStyles.getPropertyValue('--accent-color-rgb').trim() || '65, 234, 212';

    let particles = [];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2.5 + 1; // Smaller, more refined: 1px to 3.5px
            this.speedX = Math.random() * 1 - 0.5; // Softer spread
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `rgba(${accentColorRGB}, ${Math.random() * 0.5 + 0.4})`; // Alpha 0.4 to 0.9, slightly less intense
            this.life = 1; 
            this.decay = Math.random() * 0.03 + 0.015; // Faster decay for smaller, quicker particles
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            if (this.size > 0.15 && this.life > 0) { // Shrink faster
                 this.size -= this.decay * 1.2; 
            }
        }

        draw() {
            if (this.life > 0 && this.size > 0.15) {
                const currentAlpha = this.life.toFixed(2);
                const baseColor = `rgba(${accentColorRGB}, ${currentAlpha})`;
                
                ctx.fillStyle = baseColor;
                
                // Subtle glow for a more "HD" and "professional" feel
                ctx.shadowBlur = Math.min(5, this.size * 1.5); // Glow size proportional to particle size, capped
                ctx.shadowColor = `rgba(${accentColorRGB}, ${Math.max(0, parseFloat(currentAlpha) * 0.6)})`;

                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow properties
                ctx.shadowBlur = 0;
            }
        }
    }

    document.addEventListener('mousemove', (e) => {
        // Add 1 particle for a less dense, more elegant trail
        if (Math.random() > 0.3) { // Add particles less frequently for a cleaner look
            particles.push(new Particle(e.clientX, e.clientY));
        }
        
        // Limit total particles
        if (particles.length > 60) { // Reduced max particles
            particles = particles.slice(particles.length - 60);
        }
    });

    function animateParticles() {
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles = particles.filter(p => p.life > 0 && p.size > 0.15);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

function initializePageScripts() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    const sections = document.querySelectorAll('main section[id]');
    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - (window.innerHeight / 2.5) ) { 
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); 

    // Initialize the particle cursor effect
    initializeParticleCursor();

    // General purpose fade-in animations (excluding #tokenomics, #algorithms, #dashboard and .economic-step which have custom/specific animations)
    gsap.utils.toArray(`
        .feature-section:not(#tokenomics):not(#algorithms):not(#dashboard) .text-content > *, 
        .feature-section:not(#tokenomics):not(#algorithms):not(#dashboard) .image-content > *, 
        .feature-section:not(#tokenomics):not(#algorithms):not(#dashboard):not(#tiers) .section-content-full > h3,
        .feature-section:not(#tokenomics):not(#algorithms):not(#dashboard):not(#tiers) .section-content-full > h4,
        .feature-section:not(#tokenomics):not(#algorithms):not(#dashboard):not(#tiers) .section-content-full > p:not(.subtitle):not(.golden-objective),
        .feature-section:not(#tokenomics):not(#algorithms):not(#dashboard) .section-content-full > ul,
        .feature-section#funded-accounts .funded-table-container .funded-table, 
        #what-is-algoforge h2,
        .tier-card, 
        .feature-card, 
        #objective > .section-content-full > *:not(.golden-objective), 
        #hero .hero-content > *,
        .math-explanation-box, 
        .math-explanation-box h4, 
        .math-step,
        #founder-section > h2,
        #founder-section .founder-image-container,
        #founder-section .founder-bio > p,
        #founder-section .founder-bio > .mission-statement,
        #tiers .analytics-header > *, 
        #tiers .section-content-full > h3,
        #tiers .section-content-full > p:not(.analytics-subtitle)

    `).forEach((elem, index) => {
        gsap.fromTo(elem, 
            { opacity: 0, y: 50 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8,
                delay: elem.closest && elem.closest('.hero-content') ? index * 0.15 : 0,
                scrollTrigger: {
                    trigger: elem,
                    start: "top 90%",
                    toggleActions: "play none none none",
                }
            }
        );
    });
    
    // Animation for the golden objective phrase
    const goldenObjective = document.querySelector('.golden-objective');
    if (goldenObjective) {
        gsap.fromTo(goldenObjective,
            { opacity: 0, y: 50, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                delay: 0.3, // Slight delay after other objective elements
                scrollTrigger: {
                    trigger: goldenObjective,
                    start: "top 90%",
                    toggleActions: "play none none none",
                }
            }
        );

        goldenObjective.addEventListener('mouseenter', () => {
            gsap.to(goldenObjective, {
                scale: 1.03,
                duration: 0.3,
                ease: 'power1.out',
                textShadow: '0 0 8px var(--neon-gold-color), 0 0 15px var(--neon-gold-color), 0 0 25px var(--neon-gold-color), 0 0 35px var(--neon-gold-glow), 0 0 50px var(--neon-gold-glow)'
            });
        });
        goldenObjective.addEventListener('mouseleave', () => {
            gsap.to(goldenObjective, {
                scale: 1,
                duration: 0.3,
                ease: 'power1.out',
                textShadow: '0 0 5px var(--neon-gold-color), 0 0 10px var(--neon-gold-color), 0 0 15px var(--neon-gold-color), 0 0 20px var(--neon-gold-glow), 0 0 30px var(--neon-gold-glow)'
            });
        });
    }

    // Remove or comment out old economic step animations
    /*
    const economicSteps = gsap.utils.toArray('.economic-step');
    if (economicSteps.length > 0) {
        // ... old animation code for .economic-step elements
    }
    */

    // New Economic Cycle Diagram Interactivity
    const economicCycleSVG = document.getElementById('economic-cycle-svg');
    if (economicCycleSVG) {
        const cx = 110, cy = 110; // Center of SVG viewBox 220x220
        const R_arc = 85; // Radius for the arc path
        const numSegments = 6;
        const segmentAngle = 360 / numSegments; // 60 degrees
        const arcLengthDeg = 50; // Visual length of the arc
        const gapDeg = segmentAngle - arcLengthDeg; // 10 degrees total gap
        const baseStrokeWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cycle-stroke-width').trim() || '14');

        const segmentColors = [
            getComputedStyle(document.documentElement).getPropertyValue('--cycle-color-1').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--cycle-color-2').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--cycle-color-3').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--cycle-color-4').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--cycle-color-5').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--cycle-color-6').trim()
        ];
        
        const svgNS = "http://www.w3.org/2000/svg";

        for (let i = 0; i < numSegments; i++) {
            const stepId = i + 1;
            
            const startAngleDeg = (i * segmentAngle) + (gapDeg / 2) - 90; // -90 to start from top
            const endAngleDeg = startAngleDeg + arcLengthDeg;
            
            const startAngleRad = startAngleDeg * Math.PI / 180;
            const endAngleRad = endAngleDeg * Math.PI / 180;

            const M_x = cx + R_arc * Math.cos(startAngleRad);
            const M_y = cy + R_arc * Math.sin(startAngleRad);
            const A_endX = cx + R_arc * Math.cos(endAngleRad);
            const A_endY = cy + R_arc * Math.sin(endAngleRad);

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("class", "segment-path");
            if (stepId === 1) path.classList.add("active");
            path.setAttribute("data-step-id", stepId.toString());
            path.setAttribute("d", `M ${M_x} ${M_y} A ${R_arc} ${R_arc} 0 0 1 ${A_endX} ${A_endY}`);
            path.setAttribute("stroke", segmentColors[i]);
            path.setAttribute("stroke-width", baseStrokeWidth.toString());
            path.setAttribute("marker-end", `url(#arrowhead-${stepId})`);
            
            economicCycleSVG.appendChild(path);

            // Add number text
            const midAngleRad = (startAngleRad + endAngleRad) / 2;
            // Adjust radius for text to be slightly inside the thick stroke
            const textRadius = R_arc; 
            const textX = cx + textRadius * Math.cos(midAngleRad);
            const textY = cy + textRadius * Math.sin(midAngleRad);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("class", "segment-number");
            text.setAttribute("x", textX.toString());
            text.setAttribute("y", textY.toString());
            text.textContent = stepId.toString();
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");

             if (stepId === 6) { // Specific styling for number on yellow
                text.classList.add("on-yellow");
            }
            economicCycleSVG.appendChild(text);

            path.addEventListener('click', function() {
                const clickedStepId = this.dataset.stepId;
                
                // Update active path
                economicCycleSVG.querySelectorAll('.segment-path').forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                // Update content display
                document.querySelectorAll('.cycle-step-content').forEach(content => {
                    if (content.dataset.stepContentId === clickedStepId) {
                        gsap.to(content, { display: 'block', opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
                    } else {
                        gsap.to(content, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in', onComplete: () => content.style.display = 'none' });
                    }
                });
            });
        }
         // Entrance animation for the diagram paths
        gsap.fromTo(economicCycleSVG.querySelectorAll('.segment-path'), 
            { strokeDasharray: "500 500", strokeDashoffset: 500, opacity: 0 },
            { 
                strokeDashoffset: 0, 
                opacity: 1,
                duration: 1, 
                stagger: 0.2, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: economicCycleSVG,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            }
        );
         // Entrance animation for the numbers
        gsap.fromTo(economicCycleSVG.querySelectorAll('.segment-number'),
            { opacity: 0, scale: 0.5 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.2,
                delay: 0.5, // Delay after paths start drawing
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: economicCycleSVG,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            }
        );
        // Entrance animation for content container
        gsap.fromTo(".cycle-content-container",
            { opacity:0, y:30 },
            {
                opacity: 1, y: 0, duration: 0.8, delay: 0.3, // Delay after diagram
                scrollTrigger: {
                    trigger: ".economic-cycle-layout",
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            }
        );
    }

    function setupResponsiveTables() {
        const dashboardTable = document.querySelector('#dashboard .ranking-table');
        const fundedTables = document.querySelectorAll('.funded-table, .custom-table');

        if (window.innerWidth <= 992) { 
            if (dashboardTable) {
                dashboardTable.querySelectorAll('tbody tr').forEach(row => {
                    const headers = Array.from(dashboardTable.querySelectorAll('thead th')).map(th => th.textContent.trim());
                    row.querySelectorAll('td').forEach((cell, index) => {
                        if (!cell.hasAttribute('data-label')) {
                           cell.setAttribute('data-label', headers[index] || '');
                        }
                    });
                });
            }
            
            fundedTables.forEach(table => {
                table.querySelectorAll('tbody tr').forEach(row => {
                    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
                    row.querySelectorAll('td').forEach((cell, index) => {
                         if (!cell.hasAttribute('data-label')) { 
                            cell.setAttribute('data-label', headers[index] || '');
                        }
                    });
                });
            });
        } else {
            if (dashboardTable) {
                 dashboardTable.querySelectorAll('tbody td[data-label]').forEach(cell => cell.removeAttribute('data-label'));
            }
            fundedTables.forEach(table => {
                 table.querySelectorAll('tbody td[data-label]').forEach(cell => cell.removeAttribute('data-label'));
            });
        }
    }

    // Animations for #dashboard section (new leaderboard content)
    const dashboardSection = document.querySelector('#dashboard');
    if (dashboardSection) {
        const dashboardTitle = dashboardSection.querySelector('h2');
        const dashboardParagraph = dashboardSection.querySelector('p');
        const dashboardTableEl = dashboardSection.querySelector('.ranking-table'); 
        const dashboardTrophyIcon = document.getElementById('dashboard-trophy-icon');

        const commonScrollTrigger = {
            trigger: dashboardSection, 
            start: "top 80%", 
            toggleActions: "play none none none",
        };

        if (dashboardTitle) {
            gsap.fromTo(dashboardTitle,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, scrollTrigger: commonScrollTrigger }
            );
        }
        if (dashboardTrophyIcon) {
            gsap.fromTo(dashboardTrophyIcon,
                { scale: 0, opacity: 0, rotation: -45 },
                { 
                    scale: 1, 
                    opacity: 1, 
                    rotation: 0, 
                    duration: 0.8, 
                    ease: 'back.out(1.7)', 
                    delay: 0.3, 
                    scrollTrigger: commonScrollTrigger 
                }
            );

            if(dashboardTitle) {
                dashboardTitle.addEventListener('mouseenter', () => {
                    gsap.to(dashboardTrophyIcon, {
                        scale: 1.25,
                        rotation: 10,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });
                dashboardTitle.addEventListener('mouseleave', () => {
                    gsap.to(dashboardTrophyIcon, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });
            }
        }
        if (dashboardParagraph) {
             gsap.fromTo(dashboardParagraph,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, delay: 0.15, scrollTrigger: commonScrollTrigger }
            );
        }
        if (dashboardTableEl) { 
            gsap.fromTo(dashboardTableEl,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, delay: 0.3, scrollTrigger: commonScrollTrigger }
            );
            
            const tableRows = gsap.utils.toArray(dashboardTableEl.querySelectorAll('tbody tr'));
            if (tableRows.length > 0) {
                gsap.fromTo(tableRows,
                    { opacity: 0, x: -30 }, 
                    {
                        opacity: 1, x: 0, duration: 0.5, stagger: 0.08, delay: 0.5, 
                        scrollTrigger: {
                            trigger: dashboardTableEl, 
                            start: "top 75%", 
                            toggleActions: "play none none none",
                        }
                    }
                );
            }
        }
    }
    
    // Animations for #algorithms section
    const algorithmsSection = document.querySelector('#algorithms');
    if (algorithmsSection) {
        // ROI Summary Title and Subtitle
        const roiSummaryTitle = algorithmsSection.querySelector('.roi-summary-title');
        const roiSummarySubtitle = algorithmsSection.querySelector('.roi-summary-subtitle');
        if (roiSummaryTitle && roiSummarySubtitle) {
            gsap.fromTo([roiSummaryTitle, roiSummarySubtitle], 
                { opacity: 0, y: 50 }, 
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
                    scrollTrigger: {
                        trigger: algorithmsSection.querySelector('.roi-summary-container'),
                        start: "top 85%",
                        toggleActions: "play none none none",
                    }
                }
            );
        }

        // ROI Table Header and Rows
        const roiTableHeader = algorithmsSection.querySelector('.roi-table-header');
        const roiTableRows = gsap.utils.toArray(algorithmsSection.querySelectorAll('.roi-table-row'));
        if (roiTableHeader && roiTableRows.length > 0) {
            gsap.fromTo([roiTableHeader, ...roiTableRows], 
                { opacity: 0, y: 30 }, 
                {
                    opacity: 1, y: 0, duration: 0.5, stagger: 0.07,
                    scrollTrigger: {
                        trigger: algorithmsSection.querySelector('.roi-table'),
                        start: "top 85%",
                        toggleActions: "play none none none",
                    }
                }
            );
        }
        
        // "Strategically Diversified Algorithms" title and paragraph
        const mainAlgoTitle = algorithmsSection.querySelector('h3:not(.roi-summary-title)');
        const mainAlgoParagraph = algorithmsSection.querySelector('p:not(.roi-summary-subtitle)');
        if (mainAlgoTitle && mainAlgoParagraph) {
            gsap.fromTo([mainAlgoTitle, mainAlgoParagraph], 
                { opacity: 0, y: 50 }, 
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
                    scrollTrigger: {
                        trigger: mainAlgoTitle, 
                        start: "top 85%",
                        toggleActions: "play none none none",
                    }
                }
            );
        }

        // Algo cards animation
        const algoCards = gsap.utils.toArray('#algorithms .algo-card');
        algoCards.forEach(card => {
            const randomBlur = Math.random() * 3 + 2.5; 
            card.dataset.initialBlur = randomBlur;
            card.dataset.initialBoxShadow = gsap.getProperty(card, "boxShadow") || 'none';

            const pTags = card.querySelectorAll('p');
            pTags.forEach(p => {
                const isFullyHidden = Math.random() < 0.6;
                p.dataset.fogOpacity = isFullyHidden ? "0" : (Math.random() * 0.2 + 0.1).toFixed(2);
                p.dataset.originalOpacity = gsap.getProperty(p, "opacity");
            });

            gsap.fromTo(card,
                { opacity: 0, y: 50, filter: `blur(${randomBlur}px)` },
                {
                    opacity: 1,
                    y: 0,
                    filter: `blur(${randomBlur}px)`,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                        toggleActions: "play none none none",
                    },
                    onStart: () => {
                        pTags.forEach((p, index) => {
                            gsap.fromTo(p,
                                { opacity: 0 },
                                {
                                    opacity: parseFloat(p.dataset.fogOpacity),
                                    duration: 0.6,
                                    delay: 0.2 + index * 0.03,
                                    ease: 'power1.out'
                                }
                            );
                        });
                    }
                }
            );

            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    filter: 'blur(0px)', scale: 1.03, y: -5, 
                    boxShadow: '0 8px 20px rgba(65,234,212,0.15)', 
                    duration: 0.3, ease: 'power1.out'
                });
                pTags.forEach(p => {
                    gsap.to(p, { opacity: parseFloat(p.dataset.originalOpacity), duration: 0.3, ease: 'power1.out' });
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    filter: `blur(${card.dataset.initialBlur}px)`, scale: 1, y: 0, 
                    boxShadow: card.dataset.initialBoxShadow, 
                    duration: 0.3, ease: 'power1.out'
                });
                pTags.forEach(p => {
                    gsap.to(p, { opacity: parseFloat(p.dataset.fogOpacity), duration: 0.3, ease: 'power1.out' });
                });
            });
        });
    }
    
    // New: Animations for user-generated-algorithms-promo
    const userAlgoPromo = document.querySelector('.user-generated-algorithms-promo');
    if (userAlgoPromo) {
        const promoTitle = userAlgoPromo.querySelector('h4');
        const promoText = userAlgoPromo.querySelector('p');
        const initialBlurValue = 3.0; 

        gsap.set(userAlgoPromo, { filter: `blur(${initialBlurValue}px)` });
        
        gsap.fromTo(userAlgoPromo,
            { opacity: 0, y: 50, filter: `blur(${initialBlurValue}px)` }, 
            {
                opacity: 1,
                y: 0,
                filter: `blur(${initialBlurValue}px)`, 
                duration: 0.8,
                scrollTrigger: {
                    trigger: userAlgoPromo,
                    start: "top 90%", 
                    toggleActions: "play none none none",
                }
            }
        );

        userAlgoPromo.addEventListener('mouseenter', () => {
            gsap.to(userAlgoPromo, {
                filter: 'blur(0px)',
                scale: 1.02, 
                boxShadow: '0 0 15px var(--neon-gold-glow), 0 0 25px var(--neon-gold-glow), 0 0 40px var(--neon-gold-color)', 
                duration: 0.3,
                ease: 'power1.out'
            });
            if (promoTitle) {
                gsap.to(promoTitle, { 
                    textShadow: '0 0 6px var(--neon-gold-color), 0 0 12px var(--neon-gold-color), 0 0 20px var(--neon-gold-glow), 0 0 30px var(--neon-gold-glow)', 
                    duration: 0.3
                });
            }
            if (promoText) {
                gsap.to(promoText, { 
                    textShadow: '0 0 4px var(--neon-gold-glow), 0 0 8px var(--neon-gold-glow)', 
                    duration: 0.3
                });
            }
        });

        userAlgoPromo.addEventListener('mouseleave', () => {
            gsap.to(userAlgoPromo, {
                filter: `blur(${initialBlurValue}px)`,
                scale: 1,
                boxShadow: '0 0 10px rgba(var(--neon-gold-glow), 0.3), 0 0 18px rgba(var(--neon-gold-glow),0.2)', 
                duration: 0.3,
                ease: 'power1.out'
            });
            if (promoTitle) {
                gsap.to(promoTitle, { 
                    textShadow: '0 0 4px var(--neon-gold-color), 0 0 8px var(--neon-gold-color), 0 0 12px var(--neon-gold-glow)', 
                    duration: 0.3
                });
            }
            if (promoText) {
                gsap.to(promoText, { 
                    textShadow: '0 0 2px rgba(var(--neon-gold-glow),0.5)', 
                    duration: 0.3
                });
            }
        });
    }

    const logoImg = document.getElementById('logo-img');
    if (logoImg) {
        const logoTl = gsap.timeline({ paused: true });
        logoTl.to(logoImg, { rotation: 360, duration: 0.7, ease: 'power2.out' })
              .to(logoImg, { scale: 1.1, duration: 0.35, yoyo: true, repeat: 1, ease: 'power1.inOut' }, "-=0.5");

        logoImg.addEventListener('mouseenter', () => logoTl.restart());
    }

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', () => {
            gsap.to(ctaButton, { 
                scale: 1.05, 
                backgroundColor: '#2fbfb1',
                boxShadow: '0 5px 15px rgba(65, 234, 212, 0.4)',
                duration: 0.2, 
                ease: 'power1.out' 
            });
        });
        ctaButton.addEventListener('mouseleave', () => {
            gsap.to(ctaButton, { 
                scale: 1, 
                backgroundColor: 'var(--accent-color)',
                boxShadow: 'none',
                duration: 0.2, 
                ease: 'power1.out' 
            });
        });
    }

    const tokenomicsSection = document.querySelector('#tokenomics');
    if (tokenomicsSection) {
        gsap.fromTo([".tokenomics-main-title", ".tokenomics-subtitle"], 
            { opacity: 0, y: 30 }, 
            { 
                opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
                scrollTrigger: { trigger: ".tokenomics-main-title", start: "top 85%" }
            }
        );

        gsap.fromTo(".token-info-card", 
            { opacity: 0, y: 30 }, 
            { 
                opacity: 1, y: 0, duration: 0.6, stagger: 0.2,
                scrollTrigger: { trigger: ".token-info-grid", start: "top 85%" }
            }
        );
        
        gsap.fromTo(".tokenomics-interactive-area",
            { opacity:0, y:30 },
            {
                opacity: 1, y: 0, duration: 0.8,
                scrollTrigger: { trigger: ".tokenomics-interactive-area", start: "top 85%"}
            }
        );

        const tabButtons = tokenomicsSection.querySelectorAll('.tab-button');
        const tabContents = tokenomicsSection.querySelectorAll('.tab-content');

        function animateTabContent(tabId) {
            const activeContent = tokenomicsSection.querySelector(`.tab-content#${tabId}`);
            if (!activeContent) return;

            gsap.fromTo(activeContent.querySelectorAll('h4, p, li, .utility-card, .solana-advantage > *, .small-note:not(.chart-note)'),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, delay: 0.1 }
            );
            
            if (tabId === 'distribution') {
                const distBars = activeContent.querySelectorAll('.dist-bar');
                const chartNote = activeContent.querySelector('.chart-note');

                if(chartNote) { 
                    gsap.fromTo(chartNote, {opacity:0, y:10}, {opacity:1, y:0, duration:0.5, delay: 0.1});
                }

                let maxValue = 0;
                distBars.forEach(bar => {
                    const val = parseFloat(bar.dataset.value);
                    if (!isNaN(val) && val > maxValue) {
                        maxValue = val;
                    }
                });

                distBars.forEach(bar => {
                    const value = parseFloat(bar.dataset.value); 
                    const label = bar.querySelector('.label');
                    const fillElement = bar.querySelector('.dist-bar-fill');
                    if (fillElement) {
                        gsap.set(fillElement, { width: '0%' });
                    }
                    if (label) {
                        gsap.set(label, { opacity: 0 });
                    }

                    let targetWidthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    targetWidthPercent = Math.min(100, Math.max(0, targetWidthPercent)); 
                    
                    if (fillElement) {
                        gsap.to(fillElement, { 
                            width: `${targetWidthPercent}%`, 
                            duration: 1, 
                            delay: 0.4, 
                            ease: 'power2.out',
                            onComplete: () => { 
                                if (label) {
                                    gsap.to(label, { opacity: 1, duration: 0.5, delay: 0.1 });
                                }
                            }
                        });
                    } else if (label) { 
                        gsap.to(label, { opacity: 1, duration: 0.5, delay: 0.5 });
                    }
                });
            }
        }
        
        const initialActiveTabButton = tokenomicsSection.querySelector('.tab-button.active');
        if (initialActiveTabButton) {
            const initialTabId = initialActiveTabButton.dataset.tab;
            const initialTabContent = tokenomicsSection.querySelector(`.tab-content#${initialTabId}`);
            
            if (initialTabContent) {
                initialTabContent.classList.add('active'); 

                ScrollTrigger.create({
                    trigger: ".tokenomics-interactive-area", 
                    start: "top 75%", 
                    once: true, 
                    onEnter: () => {
                        const activeContentElement = tokenomicsSection.querySelector(`.tab-content#${initialTabId}`);
                        if (activeContentElement && getComputedStyle(activeContentElement).display !== 'none') {
                           animateTabContent(initialTabId);
                        } else if (activeContentElement) {
                            setTimeout(() => animateTabContent(initialTabId), 0);
                        }
                    }
                });
            }
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.dataset.tab;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active'); 
                });
                
                const newActiveContent = tokenomicsSection.querySelector(`.tab-content#${targetTabId}`);
                if (newActiveContent) {
                    newActiveContent.classList.add('active'); 
                    if (getComputedStyle(newActiveContent).display !== 'none') {
                        animateTabContent(targetTabId);
                    } else {
                        setTimeout(() => animateTabContent(targetTabId), 0);
                    }
                }
            });
        });
        
        gsap.fromTo(".vision-sustainable > *", 
            { opacity: 0, y: 30 }, 
            { 
                opacity: 1, y: 0, duration: 0.6, stagger: 0.15,
                scrollTrigger: { trigger: ".vision-sustainable", start: "top 85%" }
            }
        );
    }

    const aiHelperToggle = document.getElementById('ai-helper-toggle');
    const aiHelperChatbox = document.getElementById('ai-helper-chatbox');
    const aiHelperClose = document.getElementById('ai-helper-close');

    if (aiHelperToggle && aiHelperChatbox && aiHelperClose) {
        aiHelperToggle.addEventListener('click', () => {
            aiHelperChatbox.classList.toggle('hidden');
        });

        aiHelperClose.addEventListener('click', () => {
            aiHelperChatbox.classList.add('hidden');
        });

        document.addEventListener('click', (event) => {
            if (!aiHelperChatbox.classList.contains('hidden') && 
                !aiHelperChatbox.contains(event.target) && 
                !aiHelperToggle.contains(event.target)) {
                aiHelperChatbox.classList.add('hidden');
            }
        });
    }

    setupResponsiveTables();
    window.addEventListener('resize', setupResponsiveTables);
}

document.addEventListener('DOMContentLoaded', () => {
    loadPartials().then(() => {
        console.log("All partials loaded. Initializing page scripts...");
        initializePageScripts();
    });
});