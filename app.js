/* ==========================================================================
   Dashboard Gerencial - Fundação Copel
   Lógica JavaScript Principal (Chart.js v4)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const chartInstances = {};

  // Formatter Helpers
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    if (Math.abs(val) >= 1e9) {
      return `R$ ${(val / 1e9).toFixed(2).replace('.', ',')} B`;
    }
    if (Math.abs(val) >= 1e6) {
      return `R$ ${(val / 1e6).toFixed(2).replace('.', ',')} M`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatPercent = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '0,00%';
    return (val * 100).toFixed(2).replace('.', ',') + '%';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Color Palette
  const colors = {
    blue: '#3b82f6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    indigo: '#6366f1',
    teal: '#14b8a6',
    gray: '#94a3b8'
  };

  // Chart Defaults
  Chart.defaults.font.family = "'Outfit', 'Inter', sans-serif";
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.92)';
  Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
  Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;

  // ==========================================================================
  // PÁGINA 1: FINANCEIRO
  // ==========================================================================

  // 1. Patrimônio por Plano (Filtered by Single Page Filter)
  function renderChartPatrimonio(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Patrimônio por Plano'] || [];
    if (!rawData.length) return;

    const dates = Array.from(new Set(rawData.map(d => d.Data))).sort();
    const formattedDates = dates.map(formatDate);
    const descriptions = Array.from(new Set(rawData.map(d => d['Descrição']))).filter(Boolean);

    const descColors = {
      'Patrimônio Social': colors.blue,
      'Superávit': colors.emerald,
      'Déficit': colors.rose
    };

    const datasets = descriptions.map(desc => {
      const dataPoints = dates.map(date => {
        const item = rawData.find(d => d.Data === date && d['Descrição'] === desc);
        if (!item) return null;
        let val = item[selectedPlan];
        if (val === undefined && selectedPlan === 'Plano Pecúlio') val = item['Pecúlio'];
        return (val !== undefined && val !== null) ? val : null;
      });

      return {
        label: desc,
        data: dataPoints,
        borderColor: descColors[desc] || colors.purple,
        backgroundColor: (descColors[desc] || colors.purple) + '15',
        borderWidth: 2.5,
        fill: desc === 'Patrimônio Social',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6,
        spanGaps: true
      };
    });

    const ctx = document.getElementById('chartPatrimonio').getContext('2d');
    if (chartInstances.patrimonio) chartInstances.patrimonio.destroy();

    chartInstances.patrimonio = new Chart(ctx, {
      type: 'line',
      data: { labels: formattedDates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: (val) => formatCurrency(val) } }
        }
      }
    });
  }

  // 2. Contrib. e Benef. (Filtered by Single Page Filter)
  function renderChartContribBenef(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Contrib. e Benef.'] || [];
    if (!rawData.length) return;

    const dates = Array.from(new Set(rawData.map(d => d.Data))).sort();
    const formattedDates = dates.map(formatDate);
    const descriptions = Array.from(new Set(rawData.map(d => d['Descrição']))).filter(Boolean);

    const descColors = {
      'Contribuição': colors.emerald,
      'Benefício': colors.amber
    };

    const datasets = descriptions.map(desc => {
      const dataPoints = dates.map(date => {
        const item = rawData.find(d => d.Data === date && d['Descrição'] === desc);
        if (!item) return null;
        let val = item[selectedPlan];
        if (val === undefined && selectedPlan === 'Plano Pecúlio') val = item['Pecúlio'];
        return (val !== undefined && val !== null) ? val : null;
      });

      return {
        label: desc,
        data: dataPoints,
        borderColor: descColors[desc] || colors.blue,
        backgroundColor: (descColors[desc] || colors.blue) + '15',
        borderWidth: 2.5,
        fill: false,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6,
        spanGaps: true
      };
    });

    const ctx = document.getElementById('chartContribBenef').getContext('2d');
    if (chartInstances.contribBenef) chartInstances.contribBenef.destroy();

    chartInstances.contribBenef = new Chart(ctx, {
      type: 'line',
      data: { labels: formattedDates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: (val) => formatCurrency(val) } }
        }
      }
    });
  }

  // 3. Contribuição Média (Filtered by Single Page Filter considering Descrição)
  function renderChartContribMedia(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Contribuição Média'] || [];
    if (!rawData.length) return;

    const dates = Array.from(new Set(rawData.map(d => d.Data))).sort();
    const formattedDates = dates.map(formatDate);
    const descriptions = Array.from(new Set(rawData.map(d => d['Descrição']))).filter(Boolean);

    const datasets = descriptions.map((desc, idx) => {
      const dataPoints = dates.map(date => {
        const item = rawData.find(d => d.Data === date && d['Descrição'] === desc);
        if (!item) return null;
        let val = item[selectedPlan];
        if (val === undefined && selectedPlan === 'Plano Pecúlio') val = item['Pecúlio'];
        return (val !== undefined && val !== null) ? val : null;
      });

      return {
        label: `${desc} (${selectedPlan})`,
        data: dataPoints,
        borderColor: colors.amber,
        backgroundColor: colors.amber + '15',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6,
        spanGaps: true
      };
    });

    const ctx = document.getElementById('chartContribMedia').getContext('2d');
    if (chartInstances.contribMedia) chartInstances.contribMedia.destroy();

    chartInstances.contribMedia = new Chart(ctx, {
      type: 'line',
      data: { labels: formattedDates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: (val) => formatCurrency(val) } }
        }
      }
    });
  }

  // 4. Taxa Atuarial
  function renderChartTaxaAtuarial() {
    const rawData = DASHBOARD_DATA['Taxa Atuarial'] || [];
    if (!rawData.length) return;

    const years = Array.from(new Set(rawData.map(d => d.Ano))).sort();
    const plans = Array.from(new Set(rawData.map(d => d.Plano))).filter(Boolean);

    const planColorMap = {
      'Plano Unificado': colors.blue,
      'Plano III': colors.purple
    };

    const datasets = plans.map(plan => {
      const dataPoints = years.map(year => {
        const item = rawData.find(d => d.Ano === year && d.Plano === plan);
        return item ? item.Taxa : null;
      });

      return {
        label: plan,
        data: dataPoints,
        borderColor: planColorMap[plan] || colors.emerald,
        backgroundColor: (planColorMap[plan] || colors.emerald) + '15',
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 8,
        spanGaps: true
      };
    });

    const ctx = document.getElementById('chartTaxaAtuarial').getContext('2d');
    if (chartInstances.taxaAtuarial) chartInstances.taxaAtuarial.destroy();

    chartInstances.taxaAtuarial = new Chart(ctx, {
      type: 'line',
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatPercent(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: (val) => formatPercent(val) } }
        }
      }
    });
  }

  // Update Page 1 KPI Cards dynamically based on selected plan
  // Requirement: Taxa Atuarial card displays "-" when selected plan is NOT Plano III or Plano Unificado
  function updateFinanceiroKPICards(selectedPlan = 'Plano III') {
    const rawPatrimonio = DASHBOARD_DATA['Patrimônio por Plano'] || [];
    const rawContrib = DASHBOARD_DATA['Contrib. e Benef.'] || [];
    const rawTaxa = DASHBOARD_DATA['Taxa Atuarial'] || [];

    if (rawPatrimonio.length) {
      const socialRecs = rawPatrimonio.filter(d => d['Descrição'] === 'Patrimônio Social');
      const lastSocial = socialRecs[socialRecs.length - 1];
      if (lastSocial && lastSocial[selectedPlan] !== undefined) {
        document.getElementById('kpiPatrimonioVal').textContent = formatCurrency(lastSocial[selectedPlan]);
      } else {
        document.getElementById('kpiPatrimonioVal').textContent = 'R$ -';
      }

      const superRecs = rawPatrimonio.filter(d => d['Descrição'] === 'Superávit');
      const lastSuper = superRecs[superRecs.length - 1];
      if (lastSuper && lastSuper[selectedPlan] !== undefined) {
        document.getElementById('kpiSuperavitVal').textContent = formatCurrency(lastSuper[selectedPlan]);
      } else {
        document.getElementById('kpiSuperavitVal').textContent = 'R$ -';
      }
    }

    if (rawContrib.length) {
      const contribRecs = rawContrib.filter(d => d['Descrição'] === 'Contribuição');
      const lastContrib = contribRecs[contribRecs.length - 1];
      if (lastContrib) {
        let val = lastContrib[selectedPlan];
        if (val === undefined && selectedPlan === 'Plano Pecúlio') val = lastContrib['Pecúlio'];
        document.getElementById('kpiContribVal').textContent = val !== undefined && val !== null ? formatCurrency(val) : 'R$ -';
      }
    }

    // Taxa Atuarial: only valid for Plano III and Plano Unificado
    if (selectedPlan === 'Plano III' || selectedPlan === 'Plano Unificado') {
      const taxaRec = rawTaxa.filter(d => d.Plano === selectedPlan).pop();
      if (taxaRec && taxaRec.Taxa !== undefined) {
        document.getElementById('kpiTaxaVal').textContent = formatPercent(taxaRec.Taxa);
      } else {
        document.getElementById('kpiTaxaVal').textContent = '-';
      }
    } else {
      // Set to "-" when plan is different from Plano III or Plano Unificado
      document.getElementById('kpiTaxaVal').textContent = '-';
    }
  }

  function initFinanceiroPage() {
    const filterSelect = document.getElementById('filterFinanceiroPlan');
    const currentPlan = filterSelect ? filterSelect.value : 'Plano III';

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        const plan = e.target.value;
        renderChartPatrimonio(plan);
        renderChartContribBenef(plan);
        renderChartContribMedia(plan);
        updateFinanceiroKPICards(plan);
      });
    }

    renderChartPatrimonio(currentPlan);
    renderChartContribBenef(currentPlan);
    renderChartContribMedia(currentPlan);
    renderChartTaxaAtuarial();
    updateFinanceiroKPICards(currentPlan);
  }

  // ==========================================================================
  // PÁGINA 2: PARTICIPANTE E PATROCINADOR
  // ==========================================================================
  function initParticipantesPage() {
    const filterSelect = document.getElementById('filterParticipantesPlan');
    const currentPlan = filterSelect ? filterSelect.value : 'Plano III';

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        const plan = e.target.value;
        renderChartTipoParticipantes(plan);
        renderChartPatrocStacked(plan);
        renderChartConcessoesAdesoes(plan);
      });
    }

    renderChartTipoParticipantes(currentPlan);
    renderChartPatrocStacked(currentPlan);
    renderChartConcessoesAdesoes(currentPlan);
  }

  function renderChartTipoParticipantes(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Tipo Participantes'] || [];
    if (!rawData.length) return;

    const years = Array.from(new Set(rawData.map(d => d.Ano))).sort();
    const types = Array.from(new Set(rawData.map(d => d['Tipo de Participante']))).filter(Boolean);
    const colorList = [colors.blue, colors.emerald, colors.amber, colors.purple];

    const datasets = types.map((type, idx) => {
      const dataPoints = years.map(y => {
        const item = rawData.find(d => d.Ano === y && d['Tipo de Participante'] === type);
        if (!item) return 0;
        let val = item[selectedPlan];
        if (val === undefined && selectedPlan === 'Plano Pecúlio') val = item['Pecúlio'];
        return val || 0;
      });
      return {
        label: type,
        data: dataPoints,
        backgroundColor: colorList[idx % colorList.length],
        borderRadius: 4
      };
    });

    const ctx = document.getElementById('chartTipoParticipantes').getContext('2d');
    if (chartInstances.tipoParticipantes) chartInstances.tipoParticipantes.destroy();

    chartInstances.tipoParticipantes = new Chart(ctx, {
      type: 'bar',
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }, y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } } }
      }
    });
  }

  // Participante por Patrocinador - STACKED BAR CHART
  function renderChartPatrocStacked(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Particip. por Patroc.'] || [];
    if (!rawData.length) return;

    const years = Array.from(new Set(rawData.map(d => d.Ano))).sort();
    const patrocinadoras = Array.from(new Set(rawData.map(d => d.Patrocinadora))).filter(Boolean);
    const patrocColors = [colors.blue, colors.emerald, colors.purple, colors.amber, colors.cyan, colors.rose, colors.teal];

    const datasets = patrocinadoras.map((patroc, idx) => {
      const dataPoints = years.map(y => {
        const item = rawData.find(d => d.Ano === y && d.Patrocinadora === patroc);
        if (!item) return 0;
        let val = item[selectedPlan];
        if (val === undefined && selectedPlan === 'Plano Pecúlio') val = item['Pecúlio'];
        return val || 0;
      });

      return {
        label: patroc,
        data: dataPoints,
        backgroundColor: patrocColors[idx % patrocColors.length],
        borderRadius: 4
      };
    });

    const ctx = document.getElementById('chartPatroc').getContext('2d');
    if (chartInstances.patroc) chartInstances.patroc.destroy();

    chartInstances.patroc = new Chart(ctx, {
      type: 'bar',
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const total = items.reduce((a, b) => a + b.parsed.y, 0);
                return ` Total (${selectedPlan}): ${total}`;
              }
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // Concessões vs Adesões (Line chart)
  function renderChartConcessoesAdesoes(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Concessões vs Adesões'] || [];
    if (!rawData.length) return;

    const dates = Array.from(new Set(rawData.map(d => d.Data))).sort();
    const formattedDates = dates.map(formatDate);
    const descriptions = Array.from(new Set(rawData.map(d => d['Descrição']))).filter(Boolean);

    const descColors = {
      'Concessão': colors.amber,
      'Adesão': colors.emerald
    };

    const datasets = descriptions.map(desc => {
      const dataPoints = dates.map(date => {
        const item = rawData.find(d => d.Data === date && d['Descrição'] === desc);
        if (!item) return null;
        let val = item[selectedPlan];
        return (val !== undefined && val !== null) ? val : null;
      });

      return {
        label: `${desc} (${selectedPlan})`,
        data: dataPoints,
        borderColor: descColors[desc] || colors.blue,
        backgroundColor: (descColors[desc] || colors.blue) + '15',
        borderWidth: 2.5,
        fill: false,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6,
        spanGaps: true
      };
    });

    const ctx = document.getElementById('chartConcessoesAdesoes').getContext('2d');
    if (chartInstances.concessoesAdesoes) chartInstances.concessoesAdesoes.destroy();

    chartInstances.concessoesAdesoes = new Chart(ctx, {
      type: 'line',
      data: { labels: formattedDates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // ==========================================================================
  // PÁGINA 3: MOVIMENTAÇÕES
  // ==========================================================================
  function initMovimentacoesPage() {
    renderChartResgatesAportesLine();
    renderChartPortabilidadeDualAxis();
    
    // Independent filter for Opções por Institutos
    const filterInstitutos = document.getElementById('filterOpcoesInstitutosPlan');
    const initialPlan = filterInstitutos ? filterInstitutos.value : 'Plano III';

    if (filterInstitutos) {
      filterInstitutos.addEventListener('change', (e) => {
        renderChartOpcoesInstitutos(e.target.value);
      });
    }

    renderChartOpcoesInstitutos(initialPlan);
    populateBeneficiosTable();
  }

  // Resgates e Aportes - Line Chart with Red for Resgates and Green for Aportes
  function renderChartResgatesAportesLine() {
    const rawData = DASHBOARD_DATA['Resgates e Aportes'] || [];
    if (!rawData.length) return;

    const dates = rawData.map(d => formatDate(d.Data));
    const resgates = rawData.map(d => d.Resgates);
    const aportes = rawData.map(d => d.Aportes);

    const ctx = document.getElementById('chartResgatesAportes').getContext('2d');
    if (chartInstances.resgatesAportes) chartInstances.resgatesAportes.destroy();

    chartInstances.resgatesAportes = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Resgates',
            data: resgates,
            borderColor: colors.rose, // Red for Resgates
            backgroundColor: colors.rose + '15',
            borderWidth: 2.5,
            tension: 0.35,
            fill: false
          },
          {
            label: 'Aportes',
            data: aportes,
            borderColor: colors.emerald, // Green for Aportes
            backgroundColor: colors.emerald + '15',
            borderWidth: 2.5,
            tension: 0.35,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // Portabilidade - Dual Axis (Eixo Secundário com range de -5 a 10)
  function renderChartPortabilidadeDualAxis() {
    const rawData = DASHBOARD_DATA['Portabilidade'] || [];
    if (!rawData.length) return;

    const years = Array.from(new Set(rawData.map(d => d.Ano))).sort();

    const valEntradas = years.map(y => {
      const item = rawData.find(d => d.Ano === y && d.Categoria === 'Entrada');
      return item ? item.Valor : 0;
    });
    const valSaidas = years.map(y => {
      const item = rawData.find(d => d.Ano === y && d.Categoria === 'Saída');
      return item ? item.Valor : 0;
    });

    const qtyEntradas = years.map(y => {
      const item = rawData.find(d => d.Ano === y && d.Categoria === 'Entrada');
      return item ? item.Quantidade : 0;
    });
    const qtySaidas = years.map(y => {
      const item = rawData.find(d => d.Ano === y && d.Categoria === 'Saída');
      return item ? item.Quantidade : 0;
    });

    const ctx = document.getElementById('chartPortabilidade').getContext('2d');
    if (chartInstances.portabilidade) chartInstances.portabilidade.destroy();

    chartInstances.portabilidade = new Chart(ctx, {
      data: {
        labels: years,
        datasets: [
          {
            type: 'bar',
            label: 'Valor Entradas (R$)',
            data: valEntradas,
            backgroundColor: colors.emerald + '80', // Green for Entradas
            borderColor: colors.emerald,
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'Valor Saídas (R$)',
            data: valSaidas,
            backgroundColor: colors.rose + '80', // Red for Saídas
            borderColor: colors.rose,
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Qtd Entradas',
            data: qtyEntradas,
            borderColor: colors.emerald,
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            type: 'line',
            label: 'Qtd Saídas',
            data: qtySaidas,
            borderColor: colors.rose,
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.yAxisID === 'y') {
                  return ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`;
                }
                return ` ${ctx.dataset.label}: ${ctx.parsed.y} operações`;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { callback: (val) => formatCurrency(val) }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: -5,
            max: 10,
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Quantidade (Escala: -5 a 10)', color: colors.gray }
          }
        }
      }
    });
  }

  // Opções por Institutos - Line Chart (With Plan Filter dropdown)
  function renderChartOpcoesInstitutos(selectedPlan = 'Plano III') {
    const rawData = DASHBOARD_DATA['Opções por Institutos'] || [];
    if (!rawData.length) return;

    const years = Array.from(new Set(rawData.map(d => d.Ano))).sort();
    const types = Array.from(new Set(rawData.map(d => d['Tipo de Participante']))).filter(Boolean);
    const typeColors = [colors.blue, colors.emerald, colors.purple, colors.amber, colors.cyan];

    const datasets = types.map((type, idx) => {
      const dataPoints = years.map(y => {
        const item = rawData.find(d => d.Ano === y && d['Tipo de Participante'] === type);
        if (!item) return 0;
        let val = item[selectedPlan];
        return val !== undefined && val !== null ? val : 0;
      });

      return {
        label: `${type} (${selectedPlan})`,
        data: dataPoints,
        borderColor: typeColors[idx % typeColors.length],
        backgroundColor: typeColors[idx % typeColors.length] + '15',
        borderWidth: 2.5,
        tension: 0.35,
        fill: false
      };
    });

    const ctx = document.getElementById('chartOpcoesInstitutos').getContext('2d');
    if (chartInstances.opcoesInstitutos) chartInstances.opcoesInstitutos.destroy();

    chartInstances.opcoesInstitutos = new Chart(ctx, {
      type: 'line',
      data: { labels: years, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // Populate Médias de Benefício Table
  function populateBeneficiosTable() {
    const rawData = DASHBOARD_DATA['Tempo Médio Benefício'] || [];
    const tbody = document.getElementById('beneficiosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    rawData.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>Plano ${item.Plano}</strong></td>
        <td>${item['Tempo médio'] !== undefined ? item['Tempo médio'].toFixed(2) + ' anos' : '-'}</td>
        <td>${item['Valor Médio'] !== undefined ? formatCurrency(item['Valor Médio']) : '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // PÁGINA 4: EMPRÉSTIMOS
  // ==========================================================================
  function initEmprestimosPage() {
    renderChartCarteiras();
    renderChartInadimplenciaMilhoes();
    renderChartContratoConcessao();
    renderChartContratos();
  }

  function renderChartCarteiras() {
    const rawData = DASHBOARD_DATA['Valor das Carteiras'] || [];
    if (!rawData.length) return;

    const dates = rawData.map(d => formatDate(d.Data));

    const ctx = document.getElementById('chartCarteiras').getContext('2d');
    if (chartInstances.carteiras) chartInstances.carteiras.destroy();

    chartInstances.carteiras = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Unificado', data: rawData.map(d => d.Unificado), borderColor: colors.blue, tension: 0.3 },
          { label: 'Capitalização', data: rawData.map(d => d.Capitalização), borderColor: colors.purple, tension: 0.3 },
          { label: 'Mutualismo', data: rawData.map(d => d.Mutualismo), borderColor: colors.emerald, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: (val) => formatCurrency(val) } }
        }
      }
    });
  }

  // Inadimplência - Eixo formatado explicitamente na grandeza de MILHÕES (R$ M)
  function renderChartInadimplenciaMilhoes() {
    const rawData = DASHBOARD_DATA['Inadimplência'] || [];
    if (!rawData.length) return;

    const dates = Array.from(new Set(rawData.map(d => d.Data))).sort();
    const labels = dates.map(formatDate);
    const plans = Array.from(new Set(rawData.map(d => d.Plano))).filter(Boolean);
    const planColors = [colors.rose, colors.amber, colors.cyan];

    const datasets = plans.map((p, i) => ({
      label: p,
      data: dates.map(dt => {
        const item = rawData.find(d => d.Data === dt && d.Plano === p);
        return item ? item['Inadimplência'] : null;
      }),
      borderColor: planColors[i % planColors.length],
      borderWidth: 2.5,
      tension: 0.3
    }));

    const ctx = document.getElementById('chartInadimplencia').getContext('2d');
    if (chartInstances.inadimplencia) chartInstances.inadimplencia.destroy();

    chartInstances.inadimplencia = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const valInMilhoes = (ctx.parsed.y / 1e6).toFixed(3).replace('.', ',');
                return ` ${ctx.dataset.label}: R$ ${valInMilhoes} Mi (${formatCurrency(ctx.parsed.y)})`;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            title: { display: true, text: 'Valor em Milhões (R$ Mi)', color: colors.gray },
            ticks: {
              callback: (val) => {
                // Grandeza de Milhões (Ex: 0.11 Mi)
                const inMillions = val / 1e6;
                return `R$ ${inMillions.toFixed(2).replace('.', ',')} Mi`;
              }
            }
          }
        }
      }
    });
  }

  function renderChartContratoConcessao() {
    const rawData = DASHBOARD_DATA['Contrato e Concessão'] || [];
    if (!rawData.length) return;

    const dates = rawData.map(d => formatDate(d.Data));

    const ctx = document.getElementById('chartContratoConcessao').getContext('2d');
    if (chartInstances.contratoConcessao) chartInstances.contratoConcessao.destroy();

    chartInstances.contratoConcessao = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Contratos', data: rawData.map(d => d.Contratos), borderColor: colors.blue, tension: 0.3 },
          { label: 'Concessão', data: rawData.map(d => d.Concessão), borderColor: colors.emerald, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  function renderChartContratos() {
    const rawData = DASHBOARD_DATA['Contratos'] || [];
    if (!rawData.length) return;

    const dates = rawData.map(d => formatDate(d.Data));

    const ctx = document.getElementById('chartContratos').getContext('2d');
    if (chartInstances.contratos) chartInstances.contratos.destroy();

    chartInstances.contratos = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Novos', data: rawData.map(d => d.Novos), borderColor: colors.amber, tension: 0.3 },
          { label: 'Reforma', data: rawData.map(d => d.Reforma), borderColor: colors.purple, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // ==========================================================================
  // SIDEBAR NAVIGATION & ROUTER
  // ==========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const pageViews = document.querySelectorAll('.page-view');
  const pageTitleElem = document.getElementById('currentPageTitle');

  const pageTitles = {
    'page-financeiro': 'Financeiro',
    'page-participantes': 'Participante e Patrocinador',
    'page-movimentacoes': 'Movimentações',
    'page-emprestimos': 'Empréstimos'
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = item.getAttribute('data-page');

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      pageViews.forEach(page => page.classList.remove('active'));
      const activeView = document.getElementById(targetPage);
      if (activeView) activeView.classList.add('active');

      if (pageTitleElem && pageTitles[targetPage]) {
        pageTitleElem.textContent = pageTitles[targetPage];
      }

      if (targetPage === 'page-financeiro') initFinanceiroPage();
      else if (targetPage === 'page-participantes') initParticipantesPage();
      else if (targetPage === 'page-movimentacoes') initMovimentacoesPage();
      else if (targetPage === 'page-emprestimos') initEmprestimosPage();
    });
  });

  // Theme Toggle Button
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      themeBtn.querySelector('i').className = newTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    });
  }

  // Initial Load: Financeiro Page
  initFinanceiroPage();
});
