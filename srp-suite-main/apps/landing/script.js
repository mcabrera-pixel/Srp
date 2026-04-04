/* ============================================
   SRP — Safety RAFT Procedures — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // --- Smooth scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- Scroll animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // --- Floating card parallax on mouse move ---
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        const cards = heroVisual.querySelectorAll('.floating-card');

        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (clientX - centerX) / centerX;
            const moveY = (clientY - centerY) / centerY;

            cards.forEach((card, index) => {
                const intensity = (index + 1) * 4;
                const x = moveX * intensity;
                const y = moveY * intensity;
                card.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    // --- Counter animation for compliance score ---
    const complianceValue = document.querySelector('.card-compliance .fc-value');
    if (complianceValue) {
        let animated = false;
        const complianceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    animateCounter(complianceValue, 0, 98.7, 2000, '%');
                    complianceObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        complianceObserver.observe(complianceValue);
    }

    function animateCounter(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;

            element.textContent = isDecimal
                ? current.toFixed(1) + suffix
                : Math.round(current) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // --- Pipeline stagger animation ---
    const pipelineSection = document.querySelector('.section-pipeline');
    if (pipelineSection) {
        const pipelineItems = pipelineSection.querySelectorAll('.pipeline-item');
        let pipelineAnimated = false;

        const pipelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !pipelineAnimated) {
                    pipelineAnimated = true;
                    pipelineItems.forEach((item, index) => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(12px)';
                        item.style.transition = `opacity 0.4s ease ${index * 0.08}s, transform 0.4s ease ${index * 0.08}s`;

                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            });
                        });
                    });
                    pipelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        pipelineObserver.observe(pipelineSection);
    }

    // --- Diagnostic Express Funnel ---
    const funnelCard = document.querySelector('.funnel-card');
    if (funnelCard) {
        const steps = funnelCard.querySelectorAll('.funnel-step');
        const panels = [
            document.getElementById('funnelStep1'),
            document.getElementById('funnelStep2'),
            document.getElementById('funnelStep3')
        ];
        let currentStep = 0;

        // Scoring weights
        const SCORES = {
            tipoFaena: {
                'gran-mineria': 90, 'eecc-minera': 80, 'mediana-mineria': 60, 'otra-industria': 40
            },
            trabajadores: {
                'mas-2000': 90, '500-2000': 75, '100-500': 55, 'menos-100': 35
            },
            gestion: {
                'manual': 95, 'parcial': 60, 'sistema': 25
            }
        };

        // Findings matrix
        const FINDINGS = {
            'gran-mineria': {
                title: 'Gran Minería: Alta Exigencia Normativa',
                icon: '⛏️',
                desc: 'Operaciones de gran minería enfrentan fiscalizaciones recurrentes de SERNAGEOMIN. Un PTS desactualizado puede derivar en paralización de faena.'
            },
            'eecc-minera': {
                title: 'EECC: Responsabilidad Compartida',
                icon: '🏗️',
                desc: 'Como contratista, la responsabilidad legal es compartida con la mandante. Un gap documental puede costarte el contrato y la certificación.'
            },
            'mediana-mineria': {
                title: 'Mediana Minería: Crecimiento Rápido',
                icon: '🏭',
                desc: 'El crecimiento rápido de operaciones suele superar la capacidad de gestión documental. Es el momento ideal para digitalizar.'
            },
            'otra-industria': {
                title: 'Industria: Normativa Transversal',
                icon: '🔧',
                desc: 'Las normativas de seguridad aplican con igual fuerza fuera de la minería. DS 594 y Código del Trabajo son de cumplimiento obligatorio.'
            },
            'manual': {
                title: 'Gestión Manual = Vulnerabilidad',
                icon: '📋',
                desc: 'Excel y carpetas no ofrecen trazabilidad, versionado ni alertas. Ante una fiscalización, reunir la documentación puede tomar días.'
            },
            'parcial': {
                title: 'Digitalización Parcial: Brechas Ocultas',
                icon: '⚙️',
                desc: 'Herramientas sin integración generan silos de información. Puede haber documentos vencidos circulando sin que nadie lo sepa.'
            },
            'sistema': {
                title: 'Sistema Propio: Oportunidad de IA',
                icon: '💻',
                desc: 'Ya tienes la base. SRP puede potenciar tu sistema con generación automática de PTS y validación normativa con IA RAFT.'
            },
            'workers-high': {
                title: 'Alto Volumen Documental',
                icon: '📊',
                desc: 'Con más de 500 trabajadores, la carga documental se multiplica exponencialmente. Cada procedimiento, capacitación y evaluación genera trazabilidad obligatoria.'
            },
            'workers-low': {
                title: 'Equipo Concentrado',
                icon: '👥',
                desc: 'Un equipo más pequeño permite una implementación rápida. En semanas puedes tener toda tu documentación auditada y vigente.'
            }
        };

        // Enable/disable next buttons based on radio selection
        function setupRadioListeners(panelId, radioName, btnId) {
            const panel = document.getElementById(panelId);
            const btn = document.getElementById(btnId);
            if (!panel || !btn) return;

            panel.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
                radio.addEventListener('change', () => {
                    // For step 2, need both radios checked
                    if (panelId === 'funnelStep2') {
                        const t = panel.querySelector('input[name="trabajadores"]:checked');
                        const g = panel.querySelector('input[name="gestion"]:checked');
                        btn.disabled = !(t && g);
                    } else {
                        btn.disabled = false;
                    }
                });
            });
        }

        setupRadioListeners('funnelStep1', 'tipoFaena', 'funnelNext1');
        setupRadioListeners('funnelStep2', 'trabajadores', 'funnelNext2');
        setupRadioListeners('funnelStep2', 'gestion', 'funnelNext2');

        function goToStep(step) {
            // Update progress indicators
            steps.forEach((s, i) => {
                s.classList.remove('active', 'completed');
                if (i < step) s.classList.add('completed');
                if (i === step) s.classList.add('active');
            });

            // Show/hide panels
            panels.forEach((p, i) => {
                if (p) p.style.display = i === step ? 'block' : 'none';
            });

            currentStep = step;

            // If step 3, calculate and display results
            if (step === 2) {
                calculateAndShowResults();
            }
        }

        // Navigation buttons
        const next1 = document.getElementById('funnelNext1');
        const next2 = document.getElementById('funnelNext2');
        const prev2 = document.getElementById('funnelPrev2');
        const restart = document.getElementById('funnelRestart');

        if (next1) next1.addEventListener('click', () => goToStep(1));
        if (next2) next2.addEventListener('click', () => goToStep(2));
        if (prev2) prev2.addEventListener('click', () => goToStep(0));
        if (restart) restart.addEventListener('click', () => {
            // Reset all radios
            funnelCard.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
            document.getElementById('funnelNext1').disabled = true;
            document.getElementById('funnelNext2').disabled = true;
            goToStep(0);
        });

        function calculateAndShowResults() {
            const faena = funnelCard.querySelector('input[name="tipoFaena"]:checked')?.value;
            const workers = funnelCard.querySelector('input[name="trabajadores"]:checked')?.value;
            const gestion = funnelCard.querySelector('input[name="gestion"]:checked')?.value;

            if (!faena || !workers || !gestion) return;

            // Calculate weighted score
            const faenaScore = SCORES.tipoFaena[faena] || 50;
            const workersScore = SCORES.trabajadores[workers] || 50;
            const gestionScore = SCORES.gestion[gestion] || 50;

            const totalScore = Math.round(faenaScore * 0.3 + workersScore * 0.3 + gestionScore * 0.4);

            // Determine risk level
            let riskLevel, riskLabel;
            if (totalScore >= 70) {
                riskLevel = 'high';
                riskLabel = '🔴 Riesgo Alto';
            } else if (totalScore >= 45) {
                riskLevel = 'medium';
                riskLabel = '🟡 Riesgo Medio';
            } else {
                riskLevel = 'low';
                riskLabel = '🟢 Riesgo Bajo';
            }

            // Animate score bar
            const scoreBar = document.getElementById('scoreBar');
            const scoreValue = document.getElementById('scoreValue');
            const scoreTag = document.getElementById('scoreTag');

            scoreBar.className = 'result-score-fill risk-' + riskLevel;
            scoreTag.className = 'result-score-tag risk-' + riskLevel;

            setTimeout(() => {
                scoreBar.style.width = totalScore + '%';
            }, 100);

            // Animate counter
            animateCounter(scoreValue, 0, totalScore, 1200, '/100');
            scoreTag.textContent = riskLabel;

            // Generate findings
            const findingsEl = document.getElementById('resultFindings');
            const workersKey = (workers === 'mas-2000' || workers === '500-2000') ? 'workers-high' : 'workers-low';

            const findingsList = [FINDINGS[faena], FINDINGS[gestion], FINDINGS[workersKey]];
            findingsEl.innerHTML = findingsList.map(f => `
                <div class="finding-card">
                    <span class="finding-icon">${f.icon}</span>
                    <div>
                        <strong>${f.title}</strong>
                        <span>${f.desc}</span>
                    </div>
                </div>
            `).join('');

            // Build WhatsApp link with context
            const faenaLabels = {
                'gran-mineria': 'Gran Minería', 'eecc-minera': 'EECC Minera',
                'mediana-mineria': 'Mediana Minería', 'otra-industria': 'Otra Industria'
            };
            const workersLabels = {
                'menos-100': 'menos de 100', '100-500': '100-500',
                '500-2000': '500-2.000', 'mas-2000': 'más de 2.000'
            };
            const gestionLabels = {
                'manual': 'gestión manual/Excel', 'parcial': 'parcialmente digital',
                'sistema': 'sistema propio/ERP'
            };

            const msg = `Hola Mario, soy de ${faenaLabels[faena]} con ${workersLabels[workers]} trabajadores. ` +
                `Actualmente tenemos ${gestionLabels[gestion]}. ` +
                `Mi diagnóstico express SRP dio ${totalScore}/100 (${riskLabel}). ` +
                `Me interesa agendar un Diagnóstico Documental completo.`;

            const waLink = `https://wa.me/56979860843?text=${encodeURIComponent(msg)}`;
            document.getElementById('funnelWhatsApp').href = waLink;
        }
    }

    // --- Mobile menu toggle ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // --- Video Demo Modal ---
    const videoModal = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoPlaceholderTitle = document.getElementById('videoPlaceholderTitle');

    // Product name map for modal title
    const productNames = {
        docs: 'SRP Docs — Generación de PTS',
        guard: 'SRP Guard — Validación y Compliance',
        vault: 'SRP Vault — Gestión Documental',
        learn: 'SRP Learn — Capacitación Verificable',
    };

    // YouTube URLs — update these when videos are ready
    const productVideos = {
        docs: null,
        guard: null,
        vault: null,
        learn: null,
    };

    function openVideoModal(product) {
        if (!videoModal) return;

        // Set product title
        if (videoPlaceholderTitle) {
            videoPlaceholderTitle.textContent = productNames[product] || 'Demo SRP';
        }

        // If a YouTube URL exists, load the iframe
        const url = productVideos[product];
        if (url) {
            const placeholder = document.getElementById('videoPlaceholder');
            if (placeholder) placeholder.style.display = 'none';

            // Create and inject iframe
            const wrapper = document.querySelector('.video-modal-wrapper');
            let iframe = document.getElementById('videoIframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'videoIframe';
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
                wrapper.appendChild(iframe);
            }
            iframe.src = url;
        }

        videoModal.classList.add('active');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        if (!videoModal) return;
        videoModal.classList.remove('active');
        videoModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Stop video playback
        const iframe = document.getElementById('videoIframe');
        if (iframe) iframe.src = '';

        // Show placeholder again
        const placeholder = document.getElementById('videoPlaceholder');
        if (placeholder) placeholder.style.display = '';
    }

    // Bind demo buttons
    document.querySelectorAll('.btn-demo').forEach(btn => {
        btn.addEventListener('click', () => {
            const product = btn.getAttribute('data-product');
            openVideoModal(product);
        });
    });

    // Close handlers
    if (videoModalClose) {
        videoModalClose.addEventListener('click', closeVideoModal);
    }

    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal?.classList.contains('active')) {
            closeVideoModal();
        }
    });
});
