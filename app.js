const STORAGE_KEYS = {
  settings: 'oil_settings_v1',
  inventory: 'oil_inventory_v1',
  operations: 'oil_operations_v1'
};

const DRUM_KG = {
  diesel: 20,
  gasoline: 4
};

const OIL_LABEL = {
  diesel: 'زيت سولار',
  gasoline: 'زيت بنزين'
};

const FUEL_LABEL = {
  diesel: 'سولار',
  gasoline: 'بنزين'
};

const appState = {
  settings: null,
  inventory: null,
  operations: [],
  filteredOperations: [],
  charts: {
    consumption: null,
    monthlyCost: null,
    dailyOps: null
  }
};

const els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  cacheElements();
  ensureSeedData();
  loadState();
  bindEvents();
  setDefaultDate();
  renderAll();
}

function cacheElements() {
  els.pageTitle = document.getElementById('page-title');
  els.todayDate = document.getElementById('today-date');

  els.menuButtons = Array.from(document.querySelectorAll('.menu-item'));
  els.pages = Array.from(document.querySelectorAll('.page'));

  els.operationForm = document.getElementById('operation-form');
  els.carNumber = document.getElementById('car-number');
  els.driverName = document.getElementById('driver-name');
  els.fuelType = document.getElementById('fuel-type');
  els.oilType = document.getElementById('oil-type');
  els.quantityKg = document.getElementById('quantity-kg');
  els.odometer = document.getElementById('odometer');
  els.operationDate = document.getElementById('operation-date');
  els.costPerKgView = document.getElementById('cost-per-kg-view');
  els.totalCostView = document.getElementById('total-cost-view');
  els.formMessage = document.getElementById('form-message');
  els.opsSearch = document.getElementById('ops-search');
  els.opsTableBody = document.getElementById('ops-table-body');

  els.settingsForm = document.getElementById('settings-form');
  els.dieselDrumPrice = document.getElementById('diesel-drum-price');
  els.gasolineDrumPrice = document.getElementById('gasoline-drum-price');
  els.dieselCostPerKg = document.getElementById('diesel-cost-per-kg');
  els.gasolineCostPerKg = document.getElementById('gasoline-cost-per-kg');
  els.settingsMessage = document.getElementById('settings-message');

  els.stockForm = document.getElementById('stock-form');
  els.addDieselStock = document.getElementById('add-diesel-stock');
  els.addGasolineStock = document.getElementById('add-gasoline-stock');
  els.stockDieselView = document.getElementById('stock-diesel-view');
  els.stockGasolineView = document.getElementById('stock-gasoline-view');
  els.stockMessage = document.getElementById('stock-message');
  els.exportBackup = document.getElementById('export-backup');
  els.restoreBackup = document.getElementById('restore-backup');
  els.restoreFile = document.getElementById('restore-file');
  els.clearAllData = document.getElementById('clear-all-data');
  els.backupMessage = document.getElementById('backup-message');

  els.statTotalOps = document.getElementById('stat-total-ops');
  els.statTotalConsumption = document.getElementById('stat-total-consumption');
  els.statTotalCost = document.getElementById('stat-total-cost');
  els.statStockLeft = document.getElementById('stat-stock-left');
  els.statTopCar = document.getElementById('stat-top-car');

  els.filterFrom = document.getElementById('filter-from');
  els.filterTo = document.getElementById('filter-to');
  els.filterOil = document.getElementById('filter-oil');
  els.filterCar = document.getElementById('filter-car');
  els.filterCostMin = document.getElementById('filter-cost-min');
  els.filterCostMax = document.getElementById('filter-cost-max');
  els.filterChangeCount = document.getElementById('filter-change-count');
  els.applyFilters = document.getElementById('apply-filters');
  els.resetFilters = document.getElementById('reset-filters');
  els.reportSearch = document.getElementById('report-search');

  els.reportOpsBody = document.getElementById('report-ops-body');
  els.reportOpsTotal = document.getElementById('report-ops-total');
  els.consDiesel = document.getElementById('cons-diesel');
  els.consGasoline = document.getElementById('cons-gasoline');
  els.leftDiesel = document.getElementById('left-diesel');
  els.leftGasoline = document.getElementById('left-gasoline');
  els.costDiesel = document.getElementById('cost-diesel');
  els.costGasoline = document.getElementById('cost-gasoline');
  els.costTotal = document.getElementById('cost-total');
  els.reportConsTotal = document.getElementById('report-cons-total');
  els.reportCostTotal = document.getElementById('report-cost-total');

  els.pdfButtons = Array.from(document.querySelectorAll('[data-pdf]'));
  els.printButtons = Array.from(document.querySelectorAll('[data-print]'));
}

function ensureSeedData() {
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        dieselDrumPrice: 0,
        gasolineDrumPrice: 0
      })
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.inventory)) {
    localStorage.setItem(
      STORAGE_KEYS.inventory,
      JSON.stringify({
        dieselKg: 0,
        gasolineKg: 0
      })
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.operations)) {
    localStorage.setItem(STORAGE_KEYS.operations, JSON.stringify([]));
  }
}

function loadState() {
  appState.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings));
  appState.inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.inventory));
  appState.operations = JSON.parse(localStorage.getItem(STORAGE_KEYS.operations)) || [];
  appState.filteredOperations = [...appState.operations];
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(appState.settings));
  localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(appState.inventory));
  localStorage.setItem(STORAGE_KEYS.operations, JSON.stringify(appState.operations));
}

function bindEvents() {
  els.menuButtons.forEach((button) => {
    button.addEventListener('click', () => switchPage(button.dataset.page));
  });

  els.fuelType.addEventListener('change', updateOperationAutoFields);
  els.quantityKg.addEventListener('input', updateOperationAutoFields);
  els.settingsForm.addEventListener('submit', onSettingsSubmit);
  els.dieselDrumPrice.addEventListener('input', updateSettingsComputedCost);
  els.gasolineDrumPrice.addEventListener('input', updateSettingsComputedCost);
  els.stockForm.addEventListener('submit', onStockSubmit);
  els.operationForm.addEventListener('submit', onOperationSubmit);
  els.opsSearch.addEventListener('input', () => renderOperationsTable(els.opsSearch.value.trim()));
  if (els.exportBackup) els.exportBackup.addEventListener('click', exportBackupData);
  if (els.restoreBackup) els.restoreBackup.addEventListener('click', () => els.restoreFile.click());
  if (els.restoreFile) els.restoreFile.addEventListener('change', onRestoreFileSelected);
  if (els.clearAllData) els.clearAllData.addEventListener('click', onClearAllData);

  els.applyFilters.addEventListener('click', applyReportFilters);
  els.resetFilters.addEventListener('click', resetReportFilters);
  els.reportSearch.addEventListener('input', () => renderReportOpsTable(els.reportSearch.value.trim()));

  els.pdfButtons.forEach((btn) => {
    btn.addEventListener('click', () => exportReportPdf(btn.dataset.pdf, btn.dataset.title));
  });

  els.printButtons.forEach((btn) => {
    btn.addEventListener('click', () => printReport(btn.dataset.print));
  });
}

function setDefaultDate() {
  const today = new Date();
  els.todayDate.textContent = formatDateArabic(today.toISOString().split('T')[0]);
  if (!els.operationDate.value) {
    els.operationDate.value = today.toISOString().split('T')[0];
  }
}

function switchPage(pageId) {
  els.menuButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.page === pageId));
  els.pages.forEach((page) => page.classList.toggle('active', page.id === pageId));
  const titleMap = {
    dashboard: 'لوحة التحكم',
    operations: 'تسجيل تغيير زيت',
    settings: 'الإعدادات والمخزون',
    reports: 'التقارير'
  };
  els.pageTitle.textContent = titleMap[pageId] || 'النظام';
}

function renderAll() {
  renderSettings();
  updateOperationAutoFields();
  renderStockViews();
  renderOperationsTable('');
  renderDashboard();
  applyReportFilters();
}

function renderSettings() {
  els.dieselDrumPrice.value = appState.settings.dieselDrumPrice;
  els.gasolineDrumPrice.value = appState.settings.gasolineDrumPrice;
  updateSettingsComputedCost();
}

function updateSettingsComputedCost() {
  const dieselCost = costPerKg('diesel', Number(els.dieselDrumPrice.value || 0));
  const gasolineCost = costPerKg('gasoline', Number(els.gasolineDrumPrice.value || 0));
  els.dieselCostPerKg.value = money(dieselCost) + ' ج.م';
  els.gasolineCostPerKg.value = money(gasolineCost) + ' ج.م';
}

function onSettingsSubmit(event) {
  event.preventDefault();
  appState.settings.dieselDrumPrice = Number(els.dieselDrumPrice.value || 0);
  appState.settings.gasolineDrumPrice = Number(els.gasolineDrumPrice.value || 0);
  saveState();
  setMessage(els.settingsMessage, 'تم حفظ الأسعار بنجاح.', 'ok');
  updateOperationAutoFields();
  renderDashboard();
  applyReportFilters();
}

function onStockSubmit(event) {
  event.preventDefault();
  const addDiesel = Number(els.addDieselStock.value || 0);
  const addGasoline = Number(els.addGasolineStock.value || 0);

  if (addDiesel < 0 || addGasoline < 0) {
    setMessage(els.stockMessage, 'لا يمكن إدخال قيم سالبة.', 'err');
    return;
  }

  appState.inventory.dieselKg = round2(appState.inventory.dieselKg + addDiesel);
  appState.inventory.gasolineKg = round2(appState.inventory.gasolineKg + addGasoline);
  els.addDieselStock.value = 0;
  els.addGasolineStock.value = 0;

  saveState();
  renderStockViews();
  renderDashboard();
  applyReportFilters();
  setMessage(els.stockMessage, 'تمت إضافة الكميات للمخزون.', 'ok');
}

function renderStockViews() {
  els.stockDieselView.textContent = num(appState.inventory.dieselKg);
  els.stockGasolineView.textContent = num(appState.inventory.gasolineKg);
}

function updateOperationAutoFields() {
  const fuel = els.fuelType.value;
  if (!fuel) {
    els.oilType.value = '';
    els.costPerKgView.value = '';
    els.totalCostView.value = '';
    return;
  }

  const oilName = OIL_LABEL[fuel];
  const currentCostPerKg = fuel === 'diesel'
    ? costPerKg('diesel', appState.settings.dieselDrumPrice)
    : costPerKg('gasoline', appState.settings.gasolineDrumPrice);

  const quantity = Number(els.quantityKg.value || 0);
  const totalCost = round2(quantity * currentCostPerKg);

  els.oilType.value = oilName;
  els.costPerKgView.value = money(currentCostPerKg) + ' ج.م';
  els.totalCostView.value = money(totalCost) + ' ج.م';
}

function onOperationSubmit(event) {
  event.preventDefault();

  const fuelType = els.fuelType.value;
  const quantityKg = Number(els.quantityKg.value || 0);
  const date = els.operationDate.value;

  if (!fuelType) {
    setMessage(els.formMessage, 'اختر نوع الوقود أولًا.', 'warn');
    return;
  }

  if (quantityKg <= 0) {
    setMessage(els.formMessage, 'الكمية يجب أن تكون أكبر من صفر.', 'warn');
    return;
  }

  const available = fuelType === 'diesel' ? appState.inventory.dieselKg : appState.inventory.gasolineKg;
  if (quantityKg > available) {
    setMessage(els.formMessage, 'لا يمكن الحفظ: الكمية المطلوبة أكبر من المتاح في المخزون.', 'err');
    return;
  }

  const currentCostPerKg = fuelType === 'diesel'
    ? costPerKg('diesel', appState.settings.dieselDrumPrice)
    : costPerKg('gasoline', appState.settings.gasolineDrumPrice);

  const operation = {
    id: Date.now(),
    carNumber: els.carNumber.value.trim(),
    driverName: els.driverName.value.trim(),
    fuelType,
    oilType: OIL_LABEL[fuelType],
    quantityKg: round2(quantityKg),
    odometer: Number(els.odometer.value || 0),
    date,
    costPerKg: round2(currentCostPerKg),
    totalCost: round2(quantityKg * currentCostPerKg)
  };

  appState.operations.unshift(operation);

  if (fuelType === 'diesel') {
    appState.inventory.dieselKg = round2(appState.inventory.dieselKg - quantityKg);
  } else {
    appState.inventory.gasolineKg = round2(appState.inventory.gasolineKg - quantityKg);
  }

  saveState();
  els.operationForm.reset();
  setDefaultDate();
  updateOperationAutoFields();
  setMessage(els.formMessage, 'تم حفظ العملية وخصم الكمية من المخزون.', 'ok');

  renderStockViews();
  renderOperationsTable(els.opsSearch.value.trim());
  renderDashboard();
  applyReportFilters();
}

function renderOperationsTable(searchText) {
  const search = (searchText || '').toLowerCase();
  const rows = appState.operations.filter((op) => {
    if (!search) return true;
    const line = `${op.carNumber} ${op.driverName} ${op.oilType} ${op.quantityKg} ${op.odometer} ${op.totalCost} ${op.date}`.toLowerCase();
    return line.includes(search);
  });

  if (!rows.length) {
    els.opsTableBody.innerHTML = '<tr><td colspan="8">لا توجد بيانات مطابقة.</td></tr>';
    return;
  }

  els.opsTableBody.innerHTML = rows.map((op) => `
    <tr>
      <td>${escapeHtml(op.carNumber)}</td>
      <td>${escapeHtml(op.driverName)}</td>
      <td>${escapeHtml(op.oilType)}</td>
      <td>${num(op.quantityKg)} كجم</td>
      <td>${num(op.odometer)}</td>
      <td>${money(op.totalCost)} ج.م</td>
      <td>${formatDateArabic(op.date)}</td>
      <td class="actions-cell">
        <button type="button" class="btn danger small-btn" data-delete-op="${op.id}">حذف</button>
      </td>
    </tr>
  `).join('');

  Array.from(els.opsTableBody.querySelectorAll('[data-delete-op]')).forEach((btn) => {
    btn.addEventListener('click', () => onDeleteOperation(Number(btn.dataset.deleteOp)));
  });
}

function renderDashboard() {
  const metrics = computeMetrics(appState.operations);
  const stockLeft = round2(appState.inventory.dieselKg + appState.inventory.gasolineKg);

  els.statTotalOps.textContent = num(metrics.totalOperations);
  els.statTotalConsumption.textContent = num(metrics.totalConsumption);
  els.statTotalCost.textContent = money(metrics.totalCost) + ' ج.م';
  els.statStockLeft.textContent = num(stockLeft);
  els.statTopCar.textContent = metrics.topCar || '-';

  renderCharts(metrics);
}

function renderCharts(metrics) {
  if (typeof Chart === 'undefined') return;

  const consumptionData = [safeNumber(metrics.consumptionDiesel), safeNumber(metrics.consumptionGasoline)];
  const monthlyLabels = Object.keys(metrics.monthlyCost);
  const monthlyValues = monthlyLabels.map((m) => safeNumber(metrics.monthlyCost[m]));
  const dailyLabels = Object.keys(metrics.dailyOps);
  const dailyValues = dailyLabels.map((d) => safeNumber(metrics.dailyOps[d]));

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: 'Cairo' } } }
    },
    scales: {
      x: { ticks: { font: { family: 'Cairo' } } },
      y: {
        beginAtZero: true,
        grace: '5%',
        ticks: { font: { family: 'Cairo' } }
      }
    }
  };

  if (appState.charts.consumption) appState.charts.consumption.destroy();
  appState.charts.consumption = new Chart(document.getElementById('chart-consumption'), {
    type: 'bar',
    data: {
      labels: ['سولار', 'بنزين'],
      datasets: [{
        label: 'كمية الاستهلاك (كجم)',
        data: consumptionData,
        backgroundColor: ['#1f5f94', '#4ea6b8']
      }]
    },
    options: commonOptions
  });

  if (appState.charts.monthlyCost) appState.charts.monthlyCost.destroy();
  appState.charts.monthlyCost = new Chart(document.getElementById('chart-monthly-cost'), {
    type: 'line',
    data: {
      labels: monthlyLabels.length ? monthlyLabels : ['لا توجد بيانات'],
      datasets: [{
        label: 'التكلفة الشهرية',
        data: monthlyValues.length ? monthlyValues : [0],
        borderColor: '#2f7db8',
        backgroundColor: 'rgba(47, 125, 184, 0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: commonOptions
  });

  if (appState.charts.dailyOps) appState.charts.dailyOps.destroy();
  appState.charts.dailyOps = new Chart(document.getElementById('chart-daily-ops'), {
    type: 'line',
    data: {
      labels: dailyLabels.length ? dailyLabels : ['لا توجد بيانات'],
      datasets: [{
        label: 'عدد التغييرات',
        data: dailyValues.length ? dailyValues : [0],
        borderColor: '#0f2a43',
        backgroundColor: 'rgba(15, 42, 67, 0.14)',
        tension: 0.2,
        fill: true
      }]
    },
    options: commonOptions
  });
}

function applyReportFilters() {
  const from = els.filterFrom.value;
  const to = els.filterTo.value;
  const oil = els.filterOil.value;
  const car = els.filterCar.value.trim().toLowerCase();
  const costMin = Number(els.filterCostMin.value || 0);
  const costMax = Number(els.filterCostMax.value || 0);
  const minChanges = Number(els.filterChangeCount.value || 0);

  const countByCar = {};
  appState.operations.forEach((op) => {
    countByCar[op.carNumber] = (countByCar[op.carNumber] || 0) + 1;
  });

  appState.filteredOperations = appState.operations.filter((op) => {
    if (from && op.date < from) return false;
    if (to && op.date > to) return false;
    if (oil !== 'all' && op.fuelType !== oil) return false;
    if (car && !String(op.carNumber).toLowerCase().includes(car)) return false;
    if (els.filterCostMin.value && op.totalCost < costMin) return false;
    if (els.filterCostMax.value && op.totalCost > costMax) return false;
    if (minChanges && (countByCar[op.carNumber] || 0) < minChanges) return false;
    return true;
  });

  renderReportOpsTable(els.reportSearch.value.trim());
  renderOtherReports(appState.filteredOperations);
}

function resetReportFilters() {
  els.filterFrom.value = '';
  els.filterTo.value = '';
  els.filterOil.value = 'all';
  els.filterCar.value = '';
  els.filterCostMin.value = '';
  els.filterCostMax.value = '';
  els.filterChangeCount.value = '';
  appState.filteredOperations = [...appState.operations];
  renderReportOpsTable('');
  renderOtherReports(appState.filteredOperations);
}

function renderReportOpsTable(searchText) {
  const search = (searchText || '').toLowerCase();
  const rows = appState.filteredOperations.filter((op) => {
    if (!search) return true;
    const line = `${op.carNumber} ${op.driverName} ${op.oilType} ${op.quantityKg} ${op.odometer} ${op.totalCost} ${op.date}`.toLowerCase();
    return line.includes(search);
  });

  if (!rows.length) {
    els.reportOpsBody.innerHTML = '<tr><td colspan="7">لا توجد نتائج للتقرير.</td></tr>';
    els.reportOpsTotal.textContent = '0 ج.م';
    return;
  }

  els.reportOpsBody.innerHTML = rows.map((op) => `
    <tr>
      <td>${escapeHtml(op.carNumber)}</td>
      <td>${escapeHtml(op.driverName)}</td>
      <td>${escapeHtml(op.oilType)}</td>
      <td>${num(op.quantityKg)} كجم</td>
      <td>${num(op.odometer)}</td>
      <td>${money(op.totalCost)} ج.م</td>
      <td>${formatDateArabic(op.date)}</td>
    </tr>
  `).join('');

  const total = rows.reduce((sum, op) => sum + op.totalCost, 0);
  els.reportOpsTotal.textContent = `${money(total)} ج.م`;
}

function renderOtherReports(rows) {
  const dieselConsumption = rows
    .filter((op) => op.fuelType === 'diesel')
    .reduce((sum, op) => sum + op.quantityKg, 0);

  const gasolineConsumption = rows
    .filter((op) => op.fuelType === 'gasoline')
    .reduce((sum, op) => sum + op.quantityKg, 0);

  const dieselCost = rows
    .filter((op) => op.fuelType === 'diesel')
    .reduce((sum, op) => sum + op.totalCost, 0);

  const gasolineCost = rows
    .filter((op) => op.fuelType === 'gasoline')
    .reduce((sum, op) => sum + op.totalCost, 0);

  const totalCost = dieselCost + gasolineCost;

  els.consDiesel.textContent = num(dieselConsumption);
  els.consGasoline.textContent = num(gasolineConsumption);
  els.leftDiesel.textContent = num(appState.inventory.dieselKg);
  els.leftGasoline.textContent = num(appState.inventory.gasolineKg);

  els.costDiesel.textContent = money(dieselCost);
  els.costGasoline.textContent = money(gasolineCost);
  els.costTotal.textContent = money(totalCost);

  els.reportConsTotal.textContent = `${money(totalCost)} ج.م`;
  els.reportCostTotal.textContent = `${money(totalCost)} ج.م`;
}

function computeMetrics(rows) {
  const result = {
    totalOperations: rows.length,
    totalConsumption: 0,
    totalCost: 0,
    consumptionDiesel: 0,
    consumptionGasoline: 0,
    topCar: '',
    monthlyCost: {},
    dailyOps: {}
  };

  const carCount = {};

  rows.forEach((op) => {
    result.totalConsumption += op.quantityKg;
    result.totalCost += op.totalCost;

    if (op.fuelType === 'diesel') {
      result.consumptionDiesel += op.quantityKg;
    } else {
      result.consumptionGasoline += op.quantityKg;
    }

    carCount[op.carNumber] = (carCount[op.carNumber] || 0) + 1;

    const monthKey = op.date.slice(0, 7);
    result.monthlyCost[monthKey] = round2((result.monthlyCost[monthKey] || 0) + op.totalCost);

    result.dailyOps[op.date] = (result.dailyOps[op.date] || 0) + 1;
  });

  const top = Object.entries(carCount).sort((a, b) => b[1] - a[1])[0];
  result.topCar = top ? `${top[0]} (${top[1]} مرة)` : '-';

  result.totalConsumption = round2(result.totalConsumption);
  result.totalCost = round2(result.totalCost);
  result.consumptionDiesel = round2(result.consumptionDiesel);
  result.consumptionGasoline = round2(result.consumptionGasoline);

  result.monthlyCost = Object.fromEntries(Object.entries(result.monthlyCost).sort((a, b) => a[0].localeCompare(b[0])));
  result.dailyOps = Object.fromEntries(Object.entries(result.dailyOps).sort((a, b) => a[0].localeCompare(b[0])));

  return result;
}

async function exportReportPdf(reportId, reportTitle) {
  const reportElement = document.getElementById(reportId);
  if (!reportElement) return;

  const triggerButton = document.querySelector(`[data-pdf="${reportId}"]`);
  if (triggerButton) triggerButton.disabled = true;

  try {
    if (!window.jspdf || typeof html2canvas === 'undefined') {
      throw new Error('مكتبات PDF غير متاحة.');
    }

    let pdfWrap = buildPdfWrapper(reportElement, reportTitle, true);
    document.body.appendChild(pdfWrap);

    let canvas;
    try {
      canvas = await captureNodeAsCanvas(pdfWrap);
    } catch (firstErr) {
      pdfWrap.remove();
      pdfWrap = buildPdfWrapper(reportElement, reportTitle, false);
      document.body.appendChild(pdfWrap);
      canvas = await captureNodeAsCanvas(pdfWrap);
    } finally {
      pdfWrap.remove();
    }

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageContentHeight = pageHeight - 20;

    let renderedHeight = 0;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    renderedHeight += pageContentHeight;

    while (renderedHeight < imgHeight) {
      pdf.addPage();
      const y = 10 - renderedHeight;
      pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
      renderedHeight += pageContentHeight;
    }

    pdf.save(`${reportTitle}.pdf`);
  } catch (err) {
    console.error(err);
    alert('حدث خطأ أثناء إنشاء ملف PDF.');
  } finally {
    if (triggerButton) triggerButton.disabled = false;
  }
}

function printReport(reportId) {
  const reportElement = document.getElementById(reportId);
  if (!reportElement) return;

  const reportTitleEl = reportElement.querySelector('h3');
  const reportTitle = reportTitleEl ? reportTitleEl.textContent.trim() : 'تقرير';
  const printable = buildPrintableDocument(reportElement, reportTitle, true);

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.left = '-10000px';
  frame.style.top = '0';
  frame.style.width = '1px';
  frame.style.height = '1px';
  frame.style.opacity = '0';
  frame.setAttribute('aria-hidden', 'true');
  document.body.appendChild(frame);

  const frameDoc = frame.contentDocument || frame.contentWindow.document;
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    setTimeout(() => frame.remove(), 1200);
  };

  frameDoc.open();
  frameDoc.write(printable);
  frameDoc.close();
}

function buildPdfWrapper(reportElement, reportTitle, includeLogo) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'z-index: -9999',
    'pointer-events: none',
    'width: 900px',
    'background: #fff',
    'direction: rtl',
    'font-family: Cairo, sans-serif',
    'padding: 20px'
  ].join(';');

  const totalText = reportElement.querySelector('.report-total')
    ? reportElement.querySelector('.report-total').textContent
    : '';
  const logoSrcRaw = document.querySelector('.brand img')
    ? document.querySelector('.brand img').getAttribute('src')
    : '5.jpg';
  const logoSrc = toAbsoluteUrl(logoSrcRaw);
  const logoBlock = includeLogo
    ? `<img src="${logoSrc}" alt="شعار المصنع" style="width:62px; height:62px; object-fit:cover; border-radius:8px;" />`
    : '';

  wrapper.innerHTML = `
    <div style="border:1px solid #d5dde5; border-radius:10px; padding:14px;">
      <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid #d5dde5; padding-bottom:10px; margin-bottom:10px;">
        ${logoBlock}
        <div>
          <h2 style="margin:0; font-size:22px; color:#0f2a43;">مصنع بن البهنساوي</h2>
          <p style="margin:2px 0 0; color:#4b6077;">${reportTitle}</p>
        </div>
      </div>
      <div style="margin-bottom:8px; color:#233b55;">التاريخ: ${formatDateArabic(new Date().toISOString().split('T')[0])}</div>
      ${sanitizeReportClone(reportElement)}
      <p style="margin-top:12px; font-weight:700; color:#0f2a43;">${totalText}</p>
    </div>
  `;

  return wrapper;
}

function sanitizeReportClone(reportElement) {
  const clone = reportElement.cloneNode(true);
  clone.querySelectorAll('.report-actions').forEach((el) => el.remove());
  clone.querySelectorAll('button').forEach((el) => el.remove());
  clone.querySelectorAll('input').forEach((el) => el.remove());
  return clone.innerHTML;
}

function exportBackupData() {
  try {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: appState.settings,
      inventory: appState.inventory,
      operations: appState.operations
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `backup_oil_system_${dateTag}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(els.backupMessage, 'تم تصدير النسخة الاحتياطية بنجاح.', 'ok');
  } catch (err) {
    console.error(err);
    setMessage(els.backupMessage, 'فشل تصدير النسخة الاحتياطية.', 'err');
  }
}

function onRestoreFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || '{}'));
      if (!isValidBackup(data)) {
        throw new Error('ملف غير صالح');
      }

      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
      localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(data.inventory));
      localStorage.setItem(STORAGE_KEYS.operations, JSON.stringify(data.operations));

      loadState();
      renderAll();
      setMessage(els.backupMessage, 'تمت استعادة البيانات بنجاح.', 'ok');
    } catch (err) {
      console.error(err);
      setMessage(els.backupMessage, 'فشل الاستعادة: ملف النسخة الاحتياطية غير صالح.', 'err');
    } finally {
      event.target.value = '';
    }
  };

  reader.onerror = () => {
    setMessage(els.backupMessage, 'تعذر قراءة الملف.', 'err');
    event.target.value = '';
  };

  reader.readAsText(file, 'utf-8');
}

function onDeleteOperation(operationId) {
  if (!Number.isFinite(operationId)) return;

  const operationIndex = appState.operations.findIndex((op) => op.id === operationId);
  if (operationIndex === -1) return;

  const operation = appState.operations[operationIndex];
  const isConfirmed = window.confirm(`هل تريد حذف عملية العربية رقم ${operation.carNumber}؟`);
  if (!isConfirmed) return;

  appState.operations.splice(operationIndex, 1);

  if (operation.fuelType === 'diesel') {
    appState.inventory.dieselKg = round2(appState.inventory.dieselKg + operation.quantityKg);
  } else if (operation.fuelType === 'gasoline') {
    appState.inventory.gasolineKg = round2(appState.inventory.gasolineKg + operation.quantityKg);
  }

  saveState();
  renderStockViews();
  renderOperationsTable(els.opsSearch.value.trim());
  renderDashboard();
  applyReportFilters();
  setMessage(els.formMessage, 'تم حذف العملية واسترجاع الكمية للمخزون.', 'ok');
}

function onClearAllData() {
  const isConfirmed = window.confirm('سيتم مسح كل البيانات (الإعدادات، المخزون، وسجل العمليات). هل أنت متأكد؟');
  if (!isConfirmed) return;

  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.inventory);
  localStorage.removeItem(STORAGE_KEYS.operations);

  ensureSeedData();
  loadState();
  renderAll();
  setDefaultDate();
  setMessage(els.backupMessage, 'تم مسح كل البيانات وإعادة تهيئة النظام.', 'ok');
}

function isValidBackup(data) {
  if (!data || typeof data !== 'object') return false;
  if (!data.settings || typeof data.settings !== 'object') return false;
  if (!data.inventory || typeof data.inventory !== 'object') return false;
  if (!Array.isArray(data.operations)) return false;

  const settingsOk = Number.isFinite(Number(data.settings.dieselDrumPrice))
    && Number.isFinite(Number(data.settings.gasolineDrumPrice));
  const inventoryOk = Number.isFinite(Number(data.inventory.dieselKg))
    && Number.isFinite(Number(data.inventory.gasolineKg));

  return settingsOk && inventoryOk;
}

function buildPrintableDocument(reportElement, reportTitle, includeLogo) {
  const totalText = reportElement.querySelector('.report-total')
    ? reportElement.querySelector('.report-total').textContent
    : '';
  const logoSrcRaw = document.querySelector('.brand img')
    ? document.querySelector('.brand img').getAttribute('src')
    : '5.jpg';
  const logoSrc = toAbsoluteUrl(logoSrcRaw);
  const logoBlock = includeLogo
    ? `<img src="${logoSrc}" alt="شعار المصنع" style="width:62px; height:62px; object-fit:cover; border-radius:8px;" />`
    : '';

  return `
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${reportTitle}</title>
        <style>
          body { font-family: Cairo, sans-serif; direction: rtl; padding: 20px; color: #122131; }
          .sheet { border: 1px solid #d5dde5; border-radius: 10px; padding: 14px; }
          .head { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #d5dde5; padding-bottom: 10px; margin-bottom: 10px; }
          .head h2 { margin: 0; color: #0f2a43; }
          .head p { margin: 4px 0 0; color: #4b6077; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #d5dde5; padding: 6px; text-align: right; font-size: 13px; }
          th { background: #f4f7fb; }
          .report-total { margin-top: 12px; font-weight: 700; color: #0f2a43; }
          .table-header, .report-actions, button, input { display: none !important; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="head">
            ${logoBlock}
            <div>
              <h2>مصنع بن البهنساوي</h2>
              <p>${reportTitle}</p>
            </div>
          </div>
          <div style="margin-bottom:8px; color:#233b55;">التاريخ: ${formatDateArabic(new Date().toISOString().split('T')[0])}</div>
          ${sanitizeReportClone(reportElement)}
          <p class="report-total">${totalText}</p>
        </div>
      </body>
    </html>
  `;
}

function costPerKg(type, drumPrice) {
  const drumKg = DRUM_KG[type] || 1;
  return round2(Number(drumPrice || 0) / drumKg);
}

function money(value) {
  return round2(Number(value || 0)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function num(value) {
  return round2(Number(value || 0)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function captureNodeAsCanvas(node) {
  return html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: false,
    allowTaint: true,
    imageTimeout: 0,
    logging: false
  });
}

function toAbsoluteUrl(src) {
  try {
    return new URL(src, window.location.href).href;
  } catch (_e) {
    return src;
  }
}

function formatDateArabic(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function setMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type || ''}`.trim();
  clearTimeout(element._msgTimer);
  element._msgTimer = setTimeout(() => {
    element.textContent = '';
    element.className = 'message';
  }, 3500);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
