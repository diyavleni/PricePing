document.addEventListener('DOMContentLoaded', function () {

    // Check if we are on the dashboard page
    const chartCanvas = document.getElementById('mainPriceChart');
    if (chartCanvas) {
        // Glowing Neon Style Chart for "Neon" Theme
        Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
        Chart.defaults.font.family = "'Outfit', sans-serif";

        const ctx = chartCanvas.getContext('2d');

        // Create Gradient for fill
        let gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
        gradientFill.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

        const formatCurrency = (amount) => "₹" + amount.toLocaleString("en-IN");

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'],
                datasets: [{
                    label: 'Premium Headphones Price',
                    data: [2999, 2900, 2850, 2950, 2700, 2600, 2499],
                    borderColor: '#00E5FF',
                    borderWidth: 3,
                    backgroundColor: gradientFill,
                    fill: true,
                    tension: 0.4, // Smooth curves
                    pointBackgroundColor: '#050511',
                    pointBorderColor: '#00E5FF',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#00E5FF',
                    pointHoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(5, 5, 17, 0.9)',
                        titleColor: '#00E5FF',
                        bodyColor: '#fff',
                        borderColor: 'rgba(0, 229, 255, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        intersect: false,
                        mode: 'index',
                        callbacks: {
                            label: function (context) {
                                return formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        beginAtZero: false,
                        suggestedMin: 2200,
                        suggestedMax: 3200,
                        ticks: {
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            },
            plugins: [{
                beforeDraw: chart => {
                    const ctx = chart.ctx;
                    ctx.save();

                    // Add Neon Glow Effect for the line dataset
                    if (chart.data.datasets.length) {
                        const meta = chart.getDatasetMeta(0);
                        if (meta && meta.dataset) {
                            ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
                            ctx.shadowBlur = 10;
                            ctx.shadowOffsetX = 0;
                            ctx.shadowOffsetY = 4;
                        }
                    }

                    ctx.restore();
                }
            }]
        });

        // Simulate Price Drop & Toast Notification for Demo purposes
        setTimeout(() => {
            const toastElList = [].slice.call(document.querySelectorAll('.toast'));
            const toastList = toastElList.map(function (toastEl) {
                return new bootstrap.Toast(toastEl, {
                    autohide: true,
                    delay: 5000
                });
            });

            // Show the toast
            if (toastList.length > 0) {
                // Get elements inside toast to animate text if required
                document.getElementById('toastMsg').innerText = "Wireless Headphones dropped to " + formatCurrency(2499) + "! (Target Reached)";
                toastList[0].show();
            }
        }, 2000);
    }

    // Handle form submission animation
    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Calibrating Engine...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Tracker Launched!';
                btn.style.background = 'linear-gradient(45deg, #00C853, #1de9b6)';
                btn.style.boxShadow = '0 5px 20px rgba(0, 200, 83, 0.4)';

                setTimeout(() => {
                    window.location.href = '/';
                }, 1200);
            }, 1500);
        });
    }
});
