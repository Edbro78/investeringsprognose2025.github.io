// Remove all imports and use global variables
const { useState, useMemo, useCallback, useEffect } = React;
const { createRoot } = ReactDOM;

// Chart.js is already loaded globally
const {
  Chart: ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend: ChartJsLegend,
  PointElement,
  LineElement,
  Filler,
} = Chart;

// Custom Chart components using Chart.js directly
const Bar = ({ data, options }) => {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (canvasRef.current && typeof Chart !== 'undefined') {
            // Destroy existing chart
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            // Create new chart
            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: options
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, options]);

    return React.createElement('canvas', { ref: canvasRef });
};

const Line = ({ data, options }) => {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (canvasRef.current && typeof Chart !== 'undefined') {
            // Destroy existing chart
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            // Create new chart
            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, options]);

    return React.createElement('canvas', { ref: canvasRef });
};

// Simple Doughnut/Pie using Chart.js directly
const Doughnut = ({ data, options, type = 'pie' }) => {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (canvasRef.current && typeof Chart !== 'undefined') {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, { type, data, options });
        }
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data, options, type]);

    return React.createElement('canvas', { ref: canvasRef });
};

// --- From constants.ts ---
const START_YEAR = new Date().getFullYear();

const CHART_COLORS = {
    hovedstol: '#4A6D8C', // Mørk, dempet blå/grå
    avkastning: '#88CCEE', // Lysere blå
    sparing: '#3388CC', // Hovedblå
    utbetaling_netto: '#005599', // Mørkere blå for uttak
    utbetaling_skatt: '#CC4B4B', // Behagelig rød for skatt (årlige utbetalinger)
    event_total_color: '#66CC99', // Behagelig grønn for hendelser
    renteskatt: '#B14444', // Behagelig rød nyanse for løpende renteskatt
    skatt2: '#E06B6B', // Behagelig rød nyanse for skatt på hendelser
    aksjeandel: '#66CCDD', // Teal
    renteandel: '#A9BCCD', // Lys grå-blå
    innskutt_kapital: '#3388CC', // Hovedblå
    aksjer_principal: '#66CCDD', // Aksjer (hovedstol) – matchende blå/teal
    aksjer_avkastning: '#88CCEE', // Aksjeavkastning – lys blå
    renter_principal: '#A9BCCD', // Renter (hovedstol) – grå-blå
    renter_avkastning: '#D1DCE7' // Renteavkastning – lys grå-blå
};

// Maks antall hendelser som kan legges til
const MAX_EVENTS = 4;

const LEGEND_DATA = [
    { label: 'Hovedstol', color: CHART_COLORS.hovedstol },
    { label: 'Avkastning', color: CHART_COLORS.avkastning },
    { label: 'Årlig sparing', color: CHART_COLORS.sparing },
    { label: 'Hendelser', color: CHART_COLORS.event_total_color },
    { label: 'Netto utbetaling', color: CHART_COLORS.utbetaling_netto },
    { label: 'Skatt på årlige utbetalinger', color: CHART_COLORS.utbetaling_skatt },
    { label: 'Skatt på hendelser', color: CHART_COLORS.skatt2 },
    { label: 'Løpende renteskatt', color: CHART_COLORS.renteskatt }
];

const INITIAL_APP_STATE = {
    initialPortfolioSize: 10000000,
    pensionPortfolioSize: 0,
    additionalPensionAmount: 0,
    investedCapital: 0,
    investmentYears: 10,
    payoutYears: 0,
    desiredAnnualPayoutAfterTax: 0,
    initialStockAllocation: 0,
    stockReturnRate: 8.0,
    bondReturnRate: 5.0,
    shieldingRate: 3.9,
    taxRate: 37.84,
    annualSavings: 0,
    events: [],
    taperingOption: 'none',
    investorType: 'Privat', // Ny state for AS eller Privat
    taxCalculationEnabled: true, // Skatteberegning på/av
    manualBondTaxRate: 22.0, // Ny state for manuell kapitalskatt
    manualStockTaxRate: 37.8, // Ny state for manuell aksjebeskatning
    desiredAnnualConsumptionPayout: 0, // Ny state for ønsket årlig uttak til forbruk
    desiredAnnualWealthTaxPayout: 0, // Ny state for ønsket årlig uttak til formuesskatt
    kpiRate: 0.0, // Ny slider for forventet KPI
    deferredInterestTax: false, // Utsatt skatt på renter (kun Privat)
    advisoryFeeRate: 0.0, // Rådgivningshonorar (prosentpoeng)
};

const STOCK_ALLOCATION_OPTIONS = [
    { label: '100% Renter', value: 0 },
    { label: '20% Aksjer', value: 20 },
    { label: '45% Aksjer', value: 45 },
    { label: '55% Aksjer', value: 55 },
    { label: '65% Aksjer', value: 65 },
    { label: '85% Aksjer', value: 85 },
    { label: '100% Aksjer', value: 100 }
];

const TAPERING_OPTIONS = [
    { id: 'tapering-none', value: 'none', label: 'Ingen', sublabel: '' },
    { id: 'tapering-5', value: '5%', label: '5% ', sublabel: '' },
    { id: 'tapering-10', value: '10%', label: '10% ', sublabel: '' },
    { id: 'tapering-15', value: '15%', label: '15% ', sublabel: '' }
];

// --- From services/prognosisCalculator.ts ---
const populateAnnualStockPercentages = (state) => {
    const totalSimulatedYears = state.investmentYears + state.payoutYears;
    const annualStockPercentages = [];

    for (let index = 0; index < totalSimulatedYears; index++) {
        const isInvestmentYear = index < state.investmentYears;
        const isPayoutYear = index >= state.investmentYears;
        let currentPercentage = 0;

        if (isInvestmentYear) {
            currentPercentage = state.initialStockAllocation;
        } else if (isPayoutYear) {
            if (state.taperingOption !== 'none') {
                const taperRate = parseFloat(state.taperingOption.replace('%', '')) / 100;
                const payoutYearIndex = index - state.investmentYears;

                const basePercentageForTapering = state.investmentYears > 0 ? annualStockPercentages[state.investmentYears - 1] : state.initialStockAllocation;
                const reductionAmount = payoutYearIndex * (taperRate * 100);
                currentPercentage = Math.max(0, basePercentageForTapering - reductionAmount);
            } else {
                currentPercentage = state.initialStockAllocation;
            }
        }
        annualStockPercentages.push(currentPercentage);
    }
    return annualStockPercentages;
};

const calculatePrognosis = (state) => {
    const labels = [];
    const data = {
        hovedstol: [], avkastning: [], sparing: [], nettoUtbetaling: [],
        skatt: [], renteskatt: [], event_total: [], skatt2: [],
        annualStockPercentages: [], annualBondPercentages: [], investedCapitalHistory: []
    };

    let currentPortfolioValue = state.initialPortfolioSize + (state.pensionPortfolioSize || 0);
    let taxFreeCapitalRemaining = state.investedCapital;
    let deferredEventTax = 0; // Tax from an event to be paid NEXT year.
    let deferredBondTax = 0; // Bond tax to be paid NEXT year (when using deferred mode)
    let untaxedBondReturnPool = 0; // Akkumulerte ubeskattede rentegevinster (Privat + utsatt rente-skatt)

    const taxesEnabled = state.taxCalculationEnabled !== false;
    const stockReturnRate = state.stockReturnRate / 100;
    const bondReturnRate = state.bondReturnRate / 100;
    const shieldingRate = state.shieldingRate / 100;
    const taxRate = state.manualStockTaxRate / 100; // Bruker manuell aksjebeskatning
    const bondTaxRate = state.manualBondTaxRate / 100; // Bruker manuell kapitalskatt
    const kpiRate = state.kpiRate / 100; // KPI som skal fordeles proporsjonalt
    const advisoryFeeRate = state.advisoryFeeRate / 100; // Rådgivningshonorar som skal fordeles proporsjonalt

    const annualStockPercentages = populateAnnualStockPercentages(state);
    const totalSimulatedYears = state.investmentYears + state.payoutYears;

    // --- START ROW ("start") BEFORE FIRST YEAR ---
    labels.push('start');
    // "Start" skal vise total investeringssum i hovedstol
    data.hovedstol.push(Math.round(state.initialPortfolioSize + (state.pensionPortfolioSize || 0)));
    data.avkastning.push(0);
    data.sparing.push(0);
    data.event_total.push(0);
    data.nettoUtbetaling.push(0);
    data.skatt.push(0);
    data.skatt2.push(0);
    data.renteskatt.push(0);
    data.annualStockPercentages.push(Math.round(state.initialStockAllocation));
    data.annualBondPercentages.push(Math.round(100 - state.initialStockAllocation));
    data.investedCapitalHistory.push(Math.round(state.investedCapital));

    for (let i = 0; i < totalSimulatedYears; i++) {
        const year = START_YEAR + i;
        labels.push(year.toString());

        const startOfYearPortfolioValue = currentPortfolioValue;
        
        // --- START OF YEAR ---

        // 1. Pay deferred tax from LAST year, split between event tax and bond tax (if enabled)
        const eventTaxToPayThisYear = taxesEnabled ? deferredEventTax : 0;
        const bondTaxToPayThisYear = taxesEnabled ? deferredBondTax : 0;
        if (taxesEnabled) {
            currentPortfolioValue -= (eventTaxToPayThisYear + bondTaxToPayThisYear);
        }
        deferredEventTax = 0; // Reset for the current year's calculation.
        deferredBondTax = 0; // Reset for the current year's calculation.

        // 2. Grow tax-free capital with shielding rate
        taxFreeCapitalRemaining *= (1 + shieldingRate);

        // 3. Handle inflows (savings and positive events)
        const isInvestmentYear = i < state.investmentYears;
        let totalInflow = isInvestmentYear ? state.annualSavings : 0;
        let eventWithdrawal = 0;
        let netEventAmountForChart = 0;

        state.events.forEach(event => {
            if (year >= event.startAar && year <= event.sluttAar) {
                netEventAmountForChart += event.belop;
                if (event.belop > 0) {
                    totalInflow += event.belop;
                } else {
                    eventWithdrawal += event.belop; // Negative value
                }
            }
        });
        currentPortfolioValue += totalInflow;
        // Only increase invested capital for inflows that are explicitly opted-in
        if (totalInflow > 0) {
            // Sum only positive event amounts flagged to increase invested capital
            let addToInvestedFromEvents = 0;
            state.events.forEach(event => {
                if (year >= event.startAar && year <= event.sluttAar) {
                    if (event.belop > 0 && event.addToInvestedCapital !== false) {
                        addToInvestedFromEvents += event.belop;
                    }
                }
            });
            const savingsPart = isInvestmentYear ? state.annualSavings : 0;
            taxFreeCapitalRemaining += (savingsPart + addToInvestedFromEvents);
        }

        // 4. Calculate investment growth and running bond tax
        const annualStockPercentage = annualStockPercentages[i];
        const annualBondPercentage = 100 - annualStockPercentage;
        let totalGrossReturn = 0;
        let totalNetReturnBeforeTax = 0; // Brutto avkastning minus KPI og honorar (før skatt)
        let annualBondTaxAmount = 0; // Bond tax paid for the CURRENT year (ikke utsatt)

        if (currentPortfolioValue > 0) {
            const stockValue = currentPortfolioValue * (annualStockPercentage / 100);
            const bondValue = currentPortfolioValue * (annualBondPercentage / 100);
            const grossStockReturn = stockValue * stockReturnRate;
            const grossBondReturn = bondValue * bondReturnRate;
            totalGrossReturn = grossStockReturn + grossBondReturn;

            // Fordel KPI og rådgivningshonorar proporsjonalt mellom aksjer og renter
            const stockKpiReduction = stockValue * kpiRate;
            const bondKpiReduction = bondValue * kpiRate;
            const stockFeeReduction = stockValue * advisoryFeeRate;
            const bondFeeReduction = bondValue * advisoryFeeRate;
            const netStockReturn = grossStockReturn - stockKpiReduction - stockFeeReduction;
            const netBondReturnBeforeTax = grossBondReturn - bondKpiReduction - bondFeeReduction;
            totalNetReturnBeforeTax = netStockReturn + netBondReturnBeforeTax;

            // Utsatt rente-skatt: Ikke betal løpende renteskatt; legg i pool og skatt neste år ved uttak
            const useDeferredBondTax = taxesEnabled && state.deferredInterestTax === true;
            if (useDeferredBondTax) {
                untaxedBondReturnPool += grossBondReturn;
                annualBondTaxAmount = 0; // ingen direkte skatt i år
                // Legg til bruttoavkastning fratrukket KPI og honorar
                currentPortfolioValue += netStockReturn + netBondReturnBeforeTax;
            } else {
                // Standard: betal løpende renteskatt samme år (på nominell renteavkastning)
                annualBondTaxAmount = taxesEnabled ? (grossBondReturn * bondTaxRate) : 0;
                currentPortfolioValue += netStockReturn + (netBondReturnBeforeTax - annualBondTaxAmount);
            }
        }

        // 5. Handle outflows and calculate taxes
        let annualWithdrawalTaxAmount = 0;
        let annualNetWithdrawalAmountForChart = 0;
        
        // 5a. Regular annual payouts (taxed in the same year)
        const isOrdinaryPayoutYear = (i >= state.investmentYears);
        const totalDesiredPayout = state.desiredAnnualConsumptionPayout + state.desiredAnnualWealthTaxPayout;
            if (isOrdinaryPayoutYear && totalDesiredPayout > 0) {
            let desiredNet = totalDesiredPayout;
            const stockShare = (annualStockPercentage / 100);
            const bondShare = 1 - stockShare;
            // AS: entire net withdrawal can be covered by invested capital until exhausted
            // Privat: only the stock portion of the net withdrawal reduces invested capital
            let fromTaxFree;
            if (state.investorType === 'Privat') {
                const stockPortionOfNet = desiredNet * stockShare;
                fromTaxFree = Math.min(stockPortionOfNet, taxFreeCapitalRemaining);
            } else {
                fromTaxFree = Math.min(desiredNet, taxFreeCapitalRemaining);
            }
            taxFreeCapitalRemaining -= fromTaxFree;
            
            const remainingDesiredNet = desiredNet - fromTaxFree;
            let grossWithdrawal = fromTaxFree;

            if (remainingDesiredNet > 0) {
                let grossNeededFromTaxable;
                
                if (taxesEnabled) {
                    if (state.investorType === 'AS') {
                        // AS: Defer utbytteskatt til neste år
                        const dividendTax = remainingDesiredNet * taxRate;
                        // Utsatt kapitalskatt på renter (proporsjonal realisering av ubeskattet rentegevinst)
                        let bondDeferredTax = 0;
                        if (state.deferredInterestTax === true) {
                            const grossFromTaxable = remainingDesiredNet; // bruttouttak før skatt (skatt tas neste år)
                            const grossFromBond = grossFromTaxable * bondShare;
                            const bondValueNow = currentPortfolioValue * bondShare; // etter avkastning, før uttak
                            const fractionOfBondPortfolio = bondValueNow > 0 ? (grossFromBond / bondValueNow) : 0;
                            const realizedUntaxedBondReturn = Math.min(untaxedBondReturnPool, untaxedBondReturnPool * fractionOfBondPortfolio);
                            untaxedBondReturnPool -= realizedUntaxedBondReturn;
                            bondDeferredTax = realizedUntaxedBondReturn * bondTaxRate;
                        }
                        grossNeededFromTaxable = remainingDesiredNet;
                        deferredEventTax += dividendTax;
                        deferredBondTax += bondDeferredTax;
                    } else {
                        // Privat: Deferer aksjeskatt + ev. kapitalskatt på ubeskattede renter proporsjonalt
                        const totalStockPortionNet = desiredNet * stockShare;
                        const stockLeftoverNet = Math.max(0, totalStockPortionNet - fromTaxFree);
                        const stockTax = stockLeftoverNet * taxRate;
                        let bondDeferredTax = 0;
                        if (state.deferredInterestTax === true) {
                            const grossFromTaxable = remainingDesiredNet;
                            const grossFromBond = grossFromTaxable * bondShare;
                            const bondValueNow = currentPortfolioValue * bondShare; // etter avkastning, før uttak
                            const fractionOfBondPortfolio = bondValueNow > 0 ? (grossFromBond / bondValueNow) : 0;
                            const realizedUntaxedBondReturn = Math.min(untaxedBondReturnPool, untaxedBondReturnPool * fractionOfBondPortfolio);
                            untaxedBondReturnPool -= realizedUntaxedBondReturn;
                            bondDeferredTax = realizedUntaxedBondReturn * bondTaxRate;
                        }
                        const totalTax = stockTax + bondDeferredTax;
                        grossNeededFromTaxable = remainingDesiredNet;
                        deferredEventTax += stockTax; // aksjeskatt
                        deferredBondTax += bondDeferredTax; // kapitalskatt på renter
                    }
                } else {
                    // No taxes: withdraw exactly the remaining desired net
                    grossNeededFromTaxable = remainingDesiredNet;
                }
                
                grossWithdrawal += grossNeededFromTaxable;
            }
            currentPortfolioValue -= grossWithdrawal;
            annualNetWithdrawalAmountForChart += desiredNet;
        }

        // 5b. Event withdrawals (tax is DEFERRED to next year)
        if (eventWithdrawal < 0) {
            const withdrawalAmount = Math.abs(eventWithdrawal);
            // Bruk porteføljeverdi FØR uttaket til å beregne proporsjoner
            const preWithdrawalPortfolioValue = currentPortfolioValue;
            const stockShare = (annualStockPercentage / 100);
            const bondShare = 1 - stockShare;
            if (state.investorType === 'Privat') {
                // Only the stock portion of the withdrawal can reduce invested capital
                const stockPortionGross = withdrawalAmount * stockShare;
                const coveredStock = Math.min(stockPortionGross, taxFreeCapitalRemaining);
                taxFreeCapitalRemaining -= coveredStock;
                const taxableFromStock = Math.max(0, stockPortionGross - coveredStock);
                const taxableFromBond = withdrawalAmount * bondShare;
                if (taxesEnabled) {
                    const stockTax = taxableFromStock * taxRate;
                    let bondTaxNextYear = 0;
                    if (state.deferredInterestTax === true) {
                        const bondValueNow = preWithdrawalPortfolioValue * bondShare; // før uttak
                        const fractionOfBondPortfolio = bondValueNow > 0 ? (taxableFromBond / bondValueNow) : 0;
                        const realizedUntaxedBondReturn = Math.min(untaxedBondReturnPool, untaxedBondReturnPool * fractionOfBondPortfolio);
                        untaxedBondReturnPool -= realizedUntaxedBondReturn;
                        bondTaxNextYear = realizedUntaxedBondReturn * bondTaxRate;
                    }
                    deferredEventTax += stockTax;
                    deferredBondTax += bondTaxNextYear;
                }
            } else {
                // AS: invested capital covers the withdrawal first; remainder is taxed as dividend
                const fromTaxFree = Math.min(withdrawalAmount, taxFreeCapitalRemaining);
                taxFreeCapitalRemaining -= fromTaxFree;
                const taxableWithdrawal = withdrawalAmount - fromTaxFree;
                if (taxesEnabled && taxableWithdrawal > 0) {
                    const dividendTax = taxableWithdrawal * taxRate;
                    let bondTaxNextYear = 0;
                    if (state.deferredInterestTax === true) {
                        const bondValueNow = preWithdrawalPortfolioValue * bondShare; // før uttak
                        const fractionOfBondPortfolio = bondValueNow > 0 ? ((taxableWithdrawal * bondShare) / bondValueNow) : 0;
                        const realizedUntaxedBondReturn = Math.min(untaxedBondReturnPool, untaxedBondReturnPool * fractionOfBondPortfolio);
                        untaxedBondReturnPool -= realizedUntaxedBondReturn;
                        bondTaxNextYear = realizedUntaxedBondReturn * bondTaxRate;
                    }
                    deferredEventTax += dividendTax;
                    deferredBondTax += bondTaxNextYear;
                }
            }
            // Til slutt trekkes selve uttaket fra porteføljen
            currentPortfolioValue = preWithdrawalPortfolioValue - withdrawalAmount;
        }
        
        // --- END OF YEAR ---

        // 6. Push data to arrays for charting
        data.hovedstol.push(Math.round(startOfYearPortfolioValue));
        // Vis avkastning NETTO for KPI og honorar i "Mål og behov"-grafen
        data.avkastning.push(Math.round(totalNetReturnBeforeTax));
        data.sparing.push(Math.round(isInvestmentYear ? state.annualSavings : 0));
        data.event_total.push(Math.round(netEventAmountForChart));
        data.nettoUtbetaling.push(Math.round(-annualNetWithdrawalAmountForChart));
        data.skatt.push(Math.round(-(taxesEnabled ? annualWithdrawalTaxAmount : 0)));
        data.skatt2.push(Math.round(-(taxesEnabled ? eventTaxToPayThisYear : 0))); // Only event tax paid THIS year
        const bondTaxPaidThisYear = taxesEnabled ? (bondTaxToPayThisYear + annualBondTaxAmount) : 0; // Deferred fra i fjor + eventuell løpende i år
        data.renteskatt.push(Math.round(-bondTaxPaidThisYear));
        data.annualStockPercentages.push(Math.round(annualStockPercentage));
        data.annualBondPercentages.push(Math.round(annualBondPercentage));
        data.investedCapitalHistory.push(Math.round(taxFreeCapitalRemaining));
    }

    return { labels, data };
};

// --- From App.tsx ---
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartJsLegend, PointElement, LineElement, Filler
);

const formatCurrency = (value) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatNumberRaw = (value) => new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

// --- HELPER & CHILD COMPONENTS --- //
const SliderInput = ({ id, label, value, min, max, step, onChange, unit, isCurrency, displayValue, allowDirectInput, inline }) => {
	const [textValue, setTextValue] = React.useState(() => (isCurrency ? formatCurrency(value) : `${formatNumberRaw(value)}${unit ? ` ${unit}` : ''}`));

	React.useEffect(() => {
		setTextValue(isCurrency ? formatCurrency(value) : `${formatNumberRaw(value)}${unit ? ` ${unit}` : ''}`);
	}, [value, isCurrency, unit]);

	const parseCurrencyInput = (raw) => {
		const digitsOnly = String(raw).replace(/[^0-9]/g, '');
		const num = parseInt(digitsOnly, 10);
		return isNaN(num) ? 0 : num;
	};

	const handleBlur = () => {
		if (!allowDirectInput) return;
		const parsed = isCurrency ? parseCurrencyInput(textValue) : parseFloat(String(textValue).replace(/[^0-9.\-]/g, '')) || 0;
		onChange(id, parsed);
		setTextValue(isCurrency ? formatCurrency(parsed) : `${formatNumberRaw(parsed)}${unit ? ` ${unit}` : ''}`);
	};

    return (
        <div>
            {inline ? (
                <div className="relative flex items-center gap-4 mt-1 pr-40">
                    <label htmlFor={id} className="typo-label text-[#333333]/80 whitespace-nowrap normal-case min-w-[90px]">{label}</label>
                    <input
                        type="range"
                        id={id}
                        name={id}
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => onChange(id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#66CCDD] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                    />
                    {allowDirectInput ? (
                    <input
                            type="text"
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            onBlur={handleBlur}
                            onFocus={(e) => e.target.select()}
                        className="bg-white border border-[#DDDDDD] rounded-md pl-3 pr-0 py-1.5 text-[#333333] text-right w-32 absolute right-4"
                        />
                    ) : (
                    <span className="typo-paragraph text-[#333333] w-32 text-right pr-1 absolute right-4">
                            {displayValue ?? (isCurrency ? formatCurrency(value) : `${formatNumberRaw(value)} ${unit}`)}
                        </span>
                    )}
                </div>
            ) : (
                <>
                    <label htmlFor={id} className="typo-label text-[#333333]/80">{label}</label>
                    <div className="flex items-center gap-4 mt-1">
                        <input
                            type="range"
                            id={id}
                            name={id}
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) => onChange(id, parseFloat(e.target.value))}
                            className="w-full h-2 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#66CCDD] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                        />
                        {allowDirectInput ? (
                            <input
                                type="text"
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                onBlur={handleBlur}
                                onFocus={(e) => e.target.select()}
                                className="bg-white border border-[#DDDDDD] rounded-md px-3 py-1.5 text-[#333333] text-right w-32"
                            />
                        ) : (
                        <span className="typo-paragraph text-[#333333] w-32 text-right pr-1">
                                {displayValue ?? (isCurrency ? formatCurrency(value) : `${formatNumberRaw(value)} ${unit}`)}
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Fjernet UI for 'Utsatt skatt på renter'

const InvestorTypeToggle = ({ value, onChange }) => (
    <div>
        <label className="typo-label text-[#333333]/80">Investor type</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
                onClick={() => onChange('investorType', 'AS')} 
                className={`p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${value === 'AS' ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}
            >
                <span>AS</span>
            </button>
            <button 
                onClick={() => onChange('investorType', 'Privat')} 
                className={`p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${value === 'Privat' ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}
            >
                <span>Privat</span>
            </button>
        </div>
    </div>
);

const TaxCalculationToggle = ({ value, onChange }) => (
    <div>
        <label className="typo-label text-[#333333]/80">Skatteberegning</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
                onClick={() => onChange('taxCalculationEnabled', true)} 
                className={`p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${value ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}
            >
                <span>På</span>
            </button>
            <button 
                onClick={() => onChange('taxCalculationEnabled', false)} 
                className={`p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${!value ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}
            >
                <span>Av</span>
            </button>
        </div>
    </div>
);

// Koble UI-toggle til app-state: "Utsatt skatt på renter"
const DeferredInterestTaxToggle = ({ value, onChange }) => {
    const selected = value ? 'Ja' : 'Nei';
    return (
        <div>
            <label className="typo-label text-[#333333]/80">Utsatt skatt på renter</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                    onClick={() => onChange('deferredInterestTax', true)}
                    className={`p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${selected === 'Ja' ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}
                >
                    <span>Ja</span>
                </button>
                <button
                    onClick={() => onChange('deferredInterestTax', false)}
                    className={`p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${selected === 'Nei' ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}
                >
                    <span>Nei</span>
                </button>
            </div>
        </div>
    );
};

const ResetAllButton = ({ onReset }) => (
    <div>
        <label className="typo-label text-[#333333]/80">Nullstill alt</label>
        <div className="mt-2">
            <button 
                onClick={onReset} 
                className="w-full p-3 rounded-lg flex items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100"
            >
                <span>Nullstill alt</span>
            </button>
        </div>
    </div>
);

const ManualTaxInput = ({ id, label, value, onChange }) => (
    <div>
        <label htmlFor={id} className="typo-label text-[#333333]/80">{label}</label>
        <div className="flex items-center gap-2 mt-1">
            <input
                type="number"
                id={id}
                name={id}
                min="0"
                max="100"
                step="0.1"
                value={value}
                onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
                className="flex-1 bg-white border border-[#DDDDDD] rounded-md px-3 py-2 text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#66CCDD] focus:border-transparent"
                placeholder="0.0"
            />
            <span className="typo-paragraph text-[#333333] w-8">%</span>
        </div>
    </div>
);

const EventRow = ({ event, onUpdate, onRemove, maxYear }) => {
    const [amount, setAmount] = useState(() => formatNumberRaw(event.belop));

    useEffect(() => {
        setAmount(formatNumberRaw(event.belop));
    }, [event.belop]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleAmountBlur = () => {
        let num = parseFloat(amount.replace(/\s/g, '').replace(/,/g, '.'));
        if (isNaN(num)) num = 0;
        onUpdate(event.id, 'belop', num);
    };

    const handleStartChange = (e) => {
        const newStart = parseInt(e.target.value, 10);
        onUpdate(event.id, 'startAar', newStart);
        if (newStart > event.sluttAar) {
            onUpdate(event.id, 'sluttAar', newStart);
        }
    };

    const handleEndChange = (e) => {
        const newEnd = parseInt(e.target.value, 10);
        onUpdate(event.id, 'sluttAar', newEnd);
        if (newEnd < event.startAar) {
            onUpdate(event.id, 'startAar', newEnd);
        }
    };

    const range = maxYear - START_YEAR;
    const leftPercent = range > 0 ? ((event.startAar - START_YEAR) / range) * 100 : 0;
    const widthPercent = range > 0 ? ((event.sluttAar - event.startAar) / range) * 100 : 0;

    return (
        <div className="bg-gray-50 border border-[#DDDDDD] rounded-lg p-3">
            <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-3">
                <input type="text" value={event.type} onChange={(e) => onUpdate(event.id, 'type', e.target.value)} className="w-full bg-white border border-[#DDDDDD] rounded-md px-3 py-1.5 text-[#333333]" placeholder="Navn på hendelse" />
                </div>
                <div className="col-span-5 relative h-10 flex items-center">
                <div className="relative w-full">
                    {/* Track background */}
                    <div className="absolute w-full h-1.5 bg-[#DDDDDD] rounded-full top-1/2 -translate-y-1/2"></div>
                    {/* Highlighted track */}
                    <div className="absolute h-1.5 bg-[#66CCDD] rounded-full top-1/2 -translate-y-1/2" style={{ left: `${leftPercent}%`, width: `${Math.max(0, widthPercent)}%` }}></div>
                    
                                         {/* Start Year Label */}
                     <span className="absolute text-sm text-gray-500 -bottom-8" style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}>{event.startAar}</span>
                     {/* End Year Label */}
                     <span className="absolute text-sm text-gray-500 -bottom-8" style={{ left: `${leftPercent + widthPercent}%`, transform: 'translateX(-50%)' }}>{event.sluttAar}</span>

                    {/* Start slider (bottom layer) */}
                    <input 
                        type="range" min={START_YEAR} max={maxYear} value={event.startAar} onChange={handleStartChange} 
                        className="absolute w-full h-1.5 appearance-none bg-transparent m-0 z-10 top-1/2 -translate-y-1/2 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#66CCDD] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none" 
                    />
                    
                    {/* End slider (top layer, track is non-interactive) */}
                    <input 
                        type="range" min={START_YEAR} max={maxYear} value={event.sluttAar} onChange={handleEndChange} 
                        className="absolute w-full h-1.5 appearance-none bg-transparent m-0 z-20 pointer-events-none top-1/2 -translate-y-1/2 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#66CCDD] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none" 
                    />
                </div>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                <input type="text" value={amount} onChange={handleAmountChange} onBlur={handleAmountBlur} className="bg-white border border-[#DDDDDD] rounded-md px-3 py-1.5 text-[#333333] text-right w-full" placeholder="Beløp" />
                </div>
                <div className="col-span-1 flex justify-end">
                <button onClick={() => onRemove(event.id)} className="text-gray-400 hover:text-[#CC0000] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                </div>
            </div>
            {/* Ja/Nei toggle – own row below, label on the left */}
            <div className="flex items-center justify-end mt-2 gap-3">
                <span className="typo-label text-[#333333]/80">Skal påvirke innskutt kapital:</span>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => onUpdate(event.id, 'addToInvestedCapital', true)}
                        className={`${event.addToInvestedCapital ? 'bg-[#66CCDD] text-white border-[#66CCDD]' : 'bg-white text-[#333333] border-[#DDDDDD]'} px-3 py-1 text-xs font-medium rounded-full border transition-colors`}
                    >
                        Ja
                    </button>
                    <button
                        type="button"
                        onClick={() => onUpdate(event.id, 'addToInvestedCapital', false)}
                        className={`${!event.addToInvestedCapital ? 'bg-[#66CCDD] text-white border-[#66CCDD]' : 'bg-white text-[#333333] border-[#DDDDDD]'} px-3 py-1 text-xs font-medium rounded-full border transition-colors`}
                    >
                        Nei
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomLegend = ({ items }) => (
    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-[#333333]/90 text-sm">
        {items.map(item => (
            <div key={item.label} className="flex items-center">
                <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: item.color }}></div>
                <span>{item.label}</span>
            </div>
        ))}
    </div>
);

// Eye icon toggle for show/hide panels
const EyeToggle = ({ visible, onToggle, className, title }) => (
    <button
        onClick={onToggle}
        title={title || (visible ? 'Skjul' : 'Vis')}
        className={`absolute -top-4 -left-4 bg-white border border-[#DDDDDD] rounded-full p-1.5 shadow hover:bg-gray-50 ${className || ''}`}
        aria-label={visible ? 'Skjul' : 'Vis'}
    >
        {visible ? (
            // Open eye
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A6D8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        ) : (
            // Slashed eye
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A6D8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-5.94"></path>
                <path d="M1 1l22 22"></path>
                <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24"></path>
                <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.06 4.02"></path>
            </svg>
        )}
    </button>
);

// --- MAIN APP COMPONENT --- //
function App() {
    const [state, setState] = useState(INITIAL_APP_STATE);
    const [showAllocationChart, setShowAllocationChart] = useState(false);
    const [showDistributionGraphic, setShowDistributionGraphic] = useState(true);
    const [showInvestedCapitalGraphic, setShowInvestedCapitalGraphic] = useState(true);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
	const [showOutputModal, setShowOutputModal] = useState(false);
	const [outputText, setOutputText] = useState('');
	const [copied, setCopied] = useState(false);
    const [showAssumptionsGraphic, setShowAssumptionsGraphic] = useState(false);
    const [advisoryInputValue, setAdvisoryInputValue] = useState(INITIAL_APP_STATE.advisoryFeeRate);

    const handleStateChange = useCallback((id, value) => {
        setState(prevState => {
            const newState = { ...prevState, [id]: value };
            const combinedPortfolio = (id === 'initialPortfolioSize' ? value : newState.initialPortfolioSize) +
                                      (id === 'pensionPortfolioSize' ? value : newState.pensionPortfolioSize);

            if ((id === 'initialPortfolioSize' || id === 'pensionPortfolioSize') && newState.investedCapital > combinedPortfolio) {
                newState.investedCapital = combinedPortfolio;
            }
            if (id === 'investedCapital' && value > combinedPortfolio) {
                newState.investedCapital = combinedPortfolio;
            }
            return newState;
        });
    }, []);

    const handleResetAll = useCallback(() => {
        setState({
            ...INITIAL_APP_STATE,
            initialPortfolioSize: 0,
            investedCapital: 0,
            desiredAnnualPayoutAfterTax: 0,
            annualSavings: 0,
            initialStockAllocation: 0, // 100% renter
            events: [],
            investorType: 'Privat', // Beholder Privat som standard
            manualBondTaxRate: 22.0, // Beholder standard kapitalskatt
            manualStockTaxRate: 37.8, // Beholder standard aksjebeskatning
            desiredAnnualConsumptionPayout: 0, // Nullstiller forbruksutbetaling
            desiredAnnualWealthTaxPayout: 0, // Nullstiller formuesskatt utbetaling
        });
    }, []);

    const handleTaperingChange = (option) => {
        setState(s => ({ ...s, taperingOption: option }));
        setShowAllocationChart(option !== 'none');
    };

    const handleAddEvent = useCallback(() => {
        setState(s => {
            const currentCount = s.events ? s.events.length : 0;
            if (currentCount >= MAX_EVENTS) return s;
            const newEvent = {
                id: `event-${Date.now()}`,
                type: 'Uttak',
                belop: 0,
                startAar: START_YEAR, // Default to current year
                sluttAar: START_YEAR, // Default to current year
                // By default, positive inflows from this event increase invested capital
                addToInvestedCapital: true,
            };
            return { ...s, events: [...s.events, newEvent] };
        });
    }, []);

    const handleUpdateEvent = useCallback((id, key, value) => {
        setState(s => ({
            ...s,
            events: s.events.map(e => e.id === id ? { ...e, [key]: value } : e)
        }));
    }, []);

    const handleRemoveEvent = useCallback((id) => {
        setState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }));
    }, []);

    const prognosis = useMemo(() => calculatePrognosis(state), [state]);

	// --- Output generation & clipboard helpers --- //
	const generateOutputText = useCallback(() => {
		const lines = [];
		const totalYears = (state.investmentYears || 0) + (state.payoutYears || 0);
		const lastIndex = Math.max(0, (prognosis.labels?.length || 1) - 1);
		const lastYearLabel = prognosis.labels?.[lastIndex] || '';
		const lastPrincipal = prognosis.data?.hovedstol?.[prognosis.data.hovedstol.length - 1] ?? 0;
		const sum = (arr) => (arr || []).reduce((a, b) => a + (Number(b) || 0), 0);
		const totalSavings = sum(prognosis.data?.sparing);
		const totalEventsNetto = sum(prognosis.data?.event_total);
		const totalNetPayout = sum(prognosis.data?.nettoUtbetaling);
		const totalSkattHendelser = sum(prognosis.data?.skatt2);
		const totalRenteskatt = sum(prognosis.data?.renteskatt);
		const startStockPct = prognosis.data?.annualStockPercentages?.[0] ?? state.initialStockAllocation;
		const endStockPct = prognosis.data?.annualStockPercentages?.[prognosis.data.annualStockPercentages.length - 1] ?? startStockPct;
		const lastInvestedCapital = prognosis.data?.investedCapitalHistory?.[prognosis.data.investedCapitalHistory.length - 1] ?? state.investedCapital;

		lines.push('Output');
		lines.push('');
		lines.push('— Inputverdier —');
		lines.push(`Porteføljestørrelse: ${formatCurrency(state.initialPortfolioSize)}`);
		lines.push(`Pensjonsportefølje: ${formatCurrency(state.pensionPortfolioSize)}`);
		lines.push(`Innskutt kapital (skattefri): ${formatCurrency(state.investedCapital)}`);
		lines.push(`Årlig sparing: ${formatCurrency(state.annualSavings)}`);
		lines.push(`Investeringsperiode: ${formatNumberRaw(state.investmentYears)} år`);
		lines.push(`Utbetalingsperiode: ${formatNumberRaw(state.payoutYears)} år`);
		lines.push(`Aksjeandel første år: ${formatNumberRaw(state.initialStockAllocation)}%`);
		lines.push(`Forventet avkastning aksjer: ${state.stockReturnRate.toFixed(1)}%`);
		lines.push(`Forventet avkastning renter: ${state.bondReturnRate.toFixed(1)}%`);
		lines.push(`Skjermingsrente: ${state.shieldingRate.toFixed(1)}%`);
		lines.push(`Utbytteskatt / skatt aksjer: ${state.manualStockTaxRate.toFixed(1)}%`);
		lines.push(`Kapitalskatt: ${state.manualBondTaxRate.toFixed(1)}%`);
		lines.push(`Forventet KPI: ${state.kpiRate.toFixed(1)}%`);
		lines.push(`Rådgivningshonorar: ${state.advisoryFeeRate.toFixed(2)}%`);
		lines.push(`Ønsket årlig uttak til forbruk: ${formatCurrency(state.desiredAnnualConsumptionPayout)}`);
		lines.push(`Ønsket årlig uttak til formuesskatt: ${formatCurrency(state.desiredAnnualWealthTaxPayout)}`);
		lines.push(`Investor type: ${state.investorType}`);
		lines.push(`Skatteberegning: ${state.taxCalculationEnabled ? 'På' : 'Av'}`);
		lines.push(`Utsatt skatt på renter: ${state.deferredInterestTax ? 'Ja' : 'Nei'}`);
		lines.push(`Aksjeandel nedtrapping: ${state.taperingOption}`);
		lines.push('');
		lines.push('Hendelser:');
		if ((state.events || []).length === 0) {
			lines.push('  (Ingen)');
		} else {
			(state.events || []).forEach((e, idx) => {
				const affects = (e.addToInvestedCapital !== false) ? 'Ja' : 'Nei';
				lines.push(`  ${idx + 1}. ${e.type || 'Hendelse'} | Beløp: ${formatCurrency(e.belop || 0)} | Fra: ${e.startAar} Til: ${e.sluttAar} | Påvirker innskutt kapital: ${affects}`);
			});
		}
		lines.push('');
		lines.push('— Resultater —');
		lines.push(`Startår: ${START_YEAR} | Antall år: ${formatNumberRaw(totalYears)} | Siste år: ${lastYearLabel}`);
		lines.push(`Hovedstol siste år: ${formatCurrency(lastPrincipal)}`);
		lines.push(`Sum årlig sparing: ${formatCurrency(totalSavings)}`);
		lines.push(`Sum hendelser (netto): ${formatCurrency(totalEventsNetto)}`);
		lines.push(`Sum netto utbetaling: ${formatCurrency(totalNetPayout)}`);
		lines.push(`Sum skatt på hendelser (betalt): ${formatCurrency(totalSkattHendelser)}`);
		lines.push(`Sum løpende renteskatt (betalt): ${formatCurrency(totalRenteskatt)}`);
		lines.push(`Aksjeandel ved start/slutt: ${formatNumberRaw(startStockPct)}% → ${formatNumberRaw(endStockPct)}%`);
		lines.push(`Innskutt kapital ved slutt: ${formatCurrency(lastInvestedCapital)}`);
		lines.push('');
		lines.push('Sanntidsdata genereres ved hvert trykk på «Output».');
		return lines.join('\n');
	}, [state, prognosis]);

	const copyTextToClipboard = useCallback(async (text) => {
		try {
			if (navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				return true;
			}
			throw new Error('Navigator clipboard not available');
		} catch (_) {
			try {
				const textarea = document.createElement('textarea');
				textarea.value = text;
				textarea.setAttribute('readonly', '');
				textarea.style.position = 'fixed';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				const successful = document.execCommand('copy');
				document.body.removeChild(textarea);
				return successful;
			} catch (err) {
				console.error('Kopiering feilet:', err);
				return false;
			}
		}
	}, []);

	const handleOpenOutput = useCallback(() => {
		setOutputText(generateOutputText());
		setShowOutputModal(true);
	}, [generateOutputText]);

	const handleCopyOutput = useCallback(async () => {
		const ok = await copyTextToClipboard(outputText);
		if (ok) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} else {
			alert('Kunne ikke kopiere teksten til utklippstavlen.');
		}
	}, [copyTextToClipboard, outputText]);

	useEffect(() => {
		if (!showOutputModal) return;
		const onKey = (e) => {
			if (e.key === 'Escape') setShowOutputModal(false);
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [showOutputModal]);

    // Målsøk: finn årlig sparing slik at hovedstol ikke er negativ i siste utbetalingsår
    const goalSeekAnnualSavings = useCallback(() => {
        // Hvis ingen utbetalingsår, eller allerede OK, gjør ingenting
        const hasPayoutYears = (state.payoutYears || 0) > 0;
        if (!hasPayoutYears) return;

        const currentLastPrincipal = prognosis.data.hovedstol[prognosis.data.hovedstol.length - 1];
        if (currentLastPrincipal >= 0) return;

        const simulateLastPrincipal = (annualSavingsValue) => {
            const p = calculatePrognosis({ ...state, annualSavings: annualSavingsValue });
            return p.data.hovedstol[p.data.hovedstol.length - 1];
        };

        // Finn øvre grense med dobling
        let low = 0;
        let high = Math.max(state.annualSavings || 0, 10000);
        let last = simulateLastPrincipal(high);
        let attempts = 0;
        while (last < 0 && high < 100000000 && attempts < 20) { // maks 100MNOK og 20 forsøk
            high *= 2;
            last = simulateLastPrincipal(high);
            attempts++;
        }

        // Hvis selv enorme verdier ikke holder, avbryt
        if (last < 0) return;

        // Binærsøk etter minste årlige sparing som gir ikke-negativ hovedstol i siste år
        for (let i = 0; i < 30; i++) {
            const mid = (low + high) / 2;
            const v = simulateLastPrincipal(mid);
            if (v >= 0) {
                high = mid;
            } else {
                low = mid;
            }
        }

        // Rund av til nærmeste slider-steg (10 000)
        const step = 10000;
        const rounded = Math.ceil(high / step) * step;
        setState(s => ({ ...s, annualSavings: rounded }));
    }, [state, prognosis.data.hovedstol]);

    const chartOptions = {
        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items) => `År ${items[0].label}`,
                    label: (context) => `${context.dataset.label || ''}: ${formatCurrency(context.raw)}`,
                }
            }
        },
        scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: '#333333' } },
            y: {
                stacked: true, grid: { color: '#DDDDDD' },
                ticks: { color: '#333333', callback: (value) => `${(value / 1000000).toLocaleString('nb-NO')} MNOK` }
            }
        }
    };
    
    const investmentChartData = {
        labels: prognosis.labels,
        datasets: [
            { label: 'Avkastning', data: prognosis.data.avkastning, backgroundColor: CHART_COLORS.avkastning, stack: 'portfolio' },
            { label: 'Årlig sparing', data: prognosis.data.sparing, backgroundColor: CHART_COLORS.sparing, stack: 'portfolio' },
            { label: 'Hovedstol', data: prognosis.data.hovedstol, backgroundColor: CHART_COLORS.hovedstol, stack: 'portfolio' },
            { label: 'Hendelser', data: prognosis.data.event_total, backgroundColor: CHART_COLORS.event_total_color, stack: 'portfolio' },
            { label: 'Netto utbetaling', data: prognosis.data.nettoUtbetaling, backgroundColor: CHART_COLORS.utbetaling_netto, stack: 'portfolio' },
            ...(state.taxCalculationEnabled ? [
                { label: 'Skatt', data: prognosis.data.skatt, backgroundColor: CHART_COLORS.utbetaling_skatt, stack: 'portfolio' },
                { label: 'Skatt på hendelser', data: prognosis.data.skatt2, backgroundColor: CHART_COLORS.skatt2, stack: 'portfolio' },
                { label: 'Løpende renteskatt', data: prognosis.data.renteskatt, backgroundColor: CHART_COLORS.renteskatt, stack: 'portfolio' },
            ] : [])
        ],
    };

    const allocationChartData = {
        labels: prognosis.labels,
        datasets: [
            { label: 'Aksjeandel', data: prognosis.data.annualStockPercentages, backgroundColor: CHART_COLORS.aksjeandel, borderColor: CHART_COLORS.aksjeandel, fill: true, tension: 0.4 },
            { label: 'Renteandel', data: prognosis.data.annualBondPercentages, backgroundColor: CHART_COLORS.renteandel, borderColor: CHART_COLORS.renteandel, fill: true, tension: 0.4 },
        ],
    };

    const investedCapitalChartData = {
        labels: prognosis.labels,
        datasets: [{ label: 'Innskutt kapital', data: prognosis.data.investedCapitalHistory, backgroundColor: CHART_COLORS.innskutt_kapital, borderColor: CHART_COLORS.innskutt_kapital }],
    };

    const allocationChartOptions = { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, stacked: true, max: 100, ticks: { ...chartOptions.scales.y.ticks, callback: (v) => `${v}%` } } }, plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: '#333333' } } } };
    const capitalChartOptions = { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, stacked: false } }, plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: '#333333' } } } };
    
    // --- Stacked bar for ALL years: Aksjer, Aksjeavkastning, Renter, Renteavkastning ---
    const labelsAllYears = useMemo(() => prognosis.labels, [prognosis.labels]); // Include 'start'
    const startValuesAllYears = useMemo(() => prognosis.data.hovedstol, [prognosis.data.hovedstol]);
    const stockPctAllYears = useMemo(() => prognosis.data.annualStockPercentages, [prognosis.data.annualStockPercentages]);

    // Start-of-year values (used only for computing returns)
    const startOfYearStockValues = useMemo(
        () => startValuesAllYears.map((startValue, i) => Math.round(startValue * (stockPctAllYears[i] / 100))),
        [startValuesAllYears, stockPctAllYears]
    );
    const startOfYearBondValues = useMemo(
        () => startValuesAllYears.map((startValue, i) => Math.round(startValue * (1 - stockPctAllYears[i] / 100))),
        [startValuesAllYears, stockPctAllYears]
    );

    // Fordeling: Uttak skal først redusere avkastning, deretter hovedstol. Aksjer kan ikke bli negativ.
    const {
        principalStockSeries,
        principalBondSeries,
        stockReturnSeries,
        bondReturnSeries,
    } = useMemo(() => {
        const len = startValuesAllYears.length;
        const stockShareArr = stockPctAllYears.map(p => (p || 0) / 100);
        const bondShareArr = stockShareArr.map(s => 1 - s);

        // Inflow/outflow pr år (index matcher labelsAllYears)
        const sparing = prognosis.data.sparing;
        const events = prognosis.data.event_total;
        const netPayout = prognosis.data.nettoUtbetaling; // negative when outflow happens

        const inflowArr = new Array(len).fill(0);
        const outflowArr = new Array(len).fill(0);
        for (let i = 0; i < len; i++) {
            inflowArr[i] = Math.max(0, (sparing[i] || 0)) + Math.max(0, (events[i] || 0));
            outflowArr[i] = (-Math.min(0, (events[i] || 0))) + (-Math.min(0, (netPayout[i] || 0)));
        }

        // Årlig bruttoavkastning pr aktivaklasse (samme metode som øvrig grafikk)
        const kpi = state.kpiRate / 100;
        const fee = state.advisoryFeeRate / 100;
        const aksjeAvkastningAnnual = startOfYearStockValues.map((v, i) => i === 0 ? 0 : Math.round(v * ((state.stockReturnRate / 100) - kpi - fee)));
        const renteAvkastningAnnual = startOfYearBondValues.map((v, i) => i === 0 ? 0 : Math.round(v * ((state.bondReturnRate / 100) - kpi - fee)));

        // Tilstand over tid
        const stockPrincipal = new Array(len).fill(0);
        const bondPrincipal = new Array(len).fill(0);
        const stockReturn = new Array(len).fill(0);
        const bondReturn = new Array(len).fill(0);

        // Startverdier (første rad = 'start')
        const combinedStart = state.initialPortfolioSize + (state.pensionPortfolioSize || 0);
        stockPrincipal[0] = Math.round(combinedStart * stockShareArr[0]);
        bondPrincipal[0] = Math.round(combinedStart * bondShareArr[0]);
        stockReturn[0] = 0;
        bondReturn[0] = 0;

        // Hjelper for proporsjonal fordeling fra to "bøtter"
        const allocateFromTwo = (amount, aAvail, bAvail) => {
            const totalAvail = aAvail + bAvail;
            if (amount <= 0 || totalAvail <= 0) return [0, 0];
            if (amount >= totalAvail) return [aAvail, bAvail];
            let aTake = (aAvail / totalAvail) * amount;
            if (aTake > aAvail) aTake = aAvail;
            let bTake = amount - aTake;
            if (bTake > bAvail) {
                bTake = bAvail;
                aTake = amount - bTake;
            }
            return [aTake, bTake];
        };

        for (let i = 1; i < len; i++) {
            // 1) Legg til årlig bruttoavkastning på eksisterende avkastning
            let sRet = stockReturn[i - 1] + (aksjeAvkastningAnnual[i] || 0);
            let bRet = bondReturn[i - 1] + (renteAvkastningAnnual[i] || 0);

            // 2) Legg til innskudd (inflow) i hovedstol iht. årets fordeling
            let sPrin = stockPrincipal[i - 1] + (inflowArr[i] * stockShareArr[i]);
            let bPrin = bondPrincipal[i - 1] + (inflowArr[i] * bondShareArr[i]);

            // 3) Trekk ut uttak: først fra avkastning, deretter fra hovedstol
            const totalOut = outflowArr[i];
            // Fra avkastning først
            const [takeFromSRet, takeFromBRet] = allocateFromTwo(totalOut, sRet, bRet);
            sRet -= takeFromSRet;
            bRet -= takeFromBRet;
            let remainder = totalOut - (takeFromSRet + takeFromBRet);

            if (remainder > 0) {
                // Deretter fra hovedstol (kan ikke bli negativ)
                const [takeFromSPrin, takeFromBPrin] = allocateFromTwo(remainder, sPrin, bPrin);
                sPrin = Math.max(0, sPrin - takeFromSPrin);
                bPrin = Math.max(0, bPrin - takeFromBPrin);
            }

            stockReturn[i] = Math.round(Math.max(0, sRet));
            bondReturn[i] = Math.round(Math.max(0, bRet));
            stockPrincipal[i] = Math.round(Math.max(0, sPrin));
            bondPrincipal[i] = Math.round(Math.max(0, bPrin));
        }

        return {
            principalStockSeries: stockPrincipal,
            principalBondSeries: bondPrincipal,
            stockReturnSeries: stockReturn,
            bondReturnSeries: bondReturn,
        };
    }, [startValuesAllYears.length, stockPctAllYears, prognosis.data.sparing, prognosis.data.event_total, prognosis.data.nettoUtbetaling, startOfYearStockValues, startOfYearBondValues, state.stockReturnRate, state.bondReturnRate, state.initialPortfolioSize]);

    const stackedAllYearsData = useMemo(() => ({
        labels: labelsAllYears,
        datasets: [
            { label: 'Aksjer', data: principalStockSeries, backgroundColor: CHART_COLORS.aksjer_principal, stack: 'allYears' },
            { label: 'Aksjeavkastning', data: stockReturnSeries, backgroundColor: CHART_COLORS.aksjer_avkastning, stack: 'allYears' },
            { label: 'Renter', data: principalBondSeries, backgroundColor: CHART_COLORS.renter_principal, stack: 'allYears' },
            { label: 'Renteavkastning', data: bondReturnSeries, backgroundColor: CHART_COLORS.renter_avkastning, stack: 'allYears' },
        ],
    }), [labelsAllYears, principalStockSeries, stockReturnSeries, principalBondSeries, bondReturnSeries]);

    const stackedAllYearsOptions = useMemo(() => ({
        ...chartOptions,
        plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: '#333333' } } },
        scales: {
            x: { ...chartOptions.scales.x, stacked: true },
            y: { ...chartOptions.scales.y, stacked: true },
        },
    }), [chartOptions]);
    
    const totalYears = state.investmentYears + state.payoutYears;
    const maxEventYear = START_YEAR + totalYears - 1;

    // --- Pie chart for portfolio split ---
    const pieData = React.useMemo(() => {
        const values = [
            Math.max(0, state.initialPortfolioSize || 0),
            Math.max(0, state.pensionPortfolioSize || 0),
            Math.max(0, state.additionalPensionAmount || 0),
        ];
        const total = values.reduce((a, b) => a + b, 0) || 1;
        return {
            labels: ['Portefølje I', 'Portefølje II', 'Likviditetsfond'],
            datasets: [{
                data: values,
                backgroundColor: [CHART_COLORS.hovedstol, CHART_COLORS.sparing, CHART_COLORS.avkastning],
                borderColor: [CHART_COLORS.hovedstol, CHART_COLORS.sparing, CHART_COLORS.avkastning],
                borderWidth: 2,
                hoverOffset: 10,
                offset: (ctx) => [12, 8, 6][ctx.dataIndex] || 6,
            }],
            _meta: { total }
        };
    }, [state.initialPortfolioSize, state.pensionPortfolioSize, state.additionalPensionAmount]);

    const pieOptions = React.useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: '#333333', usePointStyle: true, font: { size: 18, weight: '600' } } },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.raw || 0;
                        const total = ctx.chart.data._meta?.total || (ctx.dataset.data || []).reduce((a,b)=>a+(b||0),0) || 1;
                        const pct = ((val / total) * 100).toFixed(1);
                        return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
                    }
                }
            }
        }
    }), []);

    return (
        <div className="font-sans text-[#333333] bg-white p-4 sm:p-8 min-h-screen flex justify-center items-start">
            <div className="w-full max-w-[1840px] flex flex-col gap-6">

                <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col">
                    <h1 className="typo-h1 text-center text-[#4A6D8C] mb-4">Mål og behov</h1>
                    <div className="relative h-[500px]">
                        <button
                            onClick={() => setShowDisclaimer(true)}
                            className="absolute -top-12 left-2 z-10 text-xs px-2 py-1 rounded-md border border-[#4A6D8C] bg-white text-[#4A6D8C] hover:bg-gray-100"
                            title="Disclaimer/forutsetninger"
                        >
                            Disclaimer/forutsetninger
                        </button>
                        <Bar options={chartOptions} data={investmentChartData} />
                    </div>
                    <CustomLegend items={state.taxCalculationEnabled ? LEGEND_DATA : LEGEND_DATA.filter(i => !['Skatt på årlige utbetalinger','Skatt på hendelser','Løpende renteskatt'].includes(i.label))} />
                </div>

                {/* Inputfelt for porteføljestørrelse, årlig sparing og aksjeandel */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
						<div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col gap-6 relative" style={{ minHeight: '350px' }}>
                        <h2 className="typo-h2 text-[#4A6D8C]">Forutsetninger</h2>
                        <button
                            onClick={() => setShowAssumptionsGraphic(true)}
                            className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-[#4A6D8C] rounded-xl p-2.5 shadow-sm border border-[#DDDDDD]"
                            title="Vis grafikk"
                            aria-label="Vis grafikk"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h6v6H4z"></path>
                                <path d="M14 4h6v6h-6z"></path>
                                <path d="M4 14h6v6H4z"></path>
                                <path d="M14 14h6v6h-6z"></path>
                            </svg>
                        </button>
							<SliderInput id="initialPortfolioSize" label="Portefølje I (NOK)" value={state.initialPortfolioSize} min={1000000} max={100000000} step={250000} onChange={handleStateChange} isCurrency allowDirectInput />
							<SliderInput id="pensionPortfolioSize" label="Portefølje II (NOK)" value={state.pensionPortfolioSize} min={0} max={10000000} step={250000} onChange={handleStateChange} isCurrency />
							<SliderInput id="additionalPensionAmount" label="Likviditetsfond (NOK)" value={state.additionalPensionAmount} min={0} max={5000000} step={50000} onChange={handleStateChange} isCurrency />
                    </div>
                    <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col gap-6 xl:col-span-2" style={{ minHeight: '250px' }}>
                        <div>
                            <h2 className="typo-h2 text-[#4A6D8C]">Aksjeandel</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-2 mt-8 items-center">
                                {STOCK_ALLOCATION_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => handleStateChange('initialStockAllocation', opt.value)} className={`${state.initialStockAllocation === opt.value ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'} h-20 rounded-lg flex items-center justify-center text-center p-1 text-sm font-medium transition-all hover:-translate-y-0.5`}>
                                        {opt.label}
                                    </button>
                                ))}
                                {/* Målsøk sparing knapp - identisk i størrelse med kortene over */}
                                <button
                                    type="button"
                                    onClick={goalSeekAnnualSavings}
                                    className="bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100 h-20 rounded-lg flex items-center justify-center text-center p-1 text-sm font-medium transition-all hover:-translate-y-0.5"
                                >
                                    Målsøk sparing
                                </button>
                                {/* Slider på samme linje som knappen (xl), innrammet mellom 20% og 85% */}
                                <div className="hidden xl:flex xl:col-start-2 xl:col-end-6 items-center">
                                    <div className="bg-white border border-[#DDDDDD] rounded-lg h-20 w-full flex items-center px-4">
                                        <SliderInput id="annualSavings" label="Sparing" value={state.annualSavings} min={0} max={1200000} step={10000} onChange={handleStateChange} isCurrency inline />
                                    </div>
                                </div>
                            </div>
                            {/* Fallback for mindre skjermer: plasser slider under */}
                            <div className="xl:hidden mt-2">
                                <div className="w-[740px] max-w-full mx-auto">
                                    <SliderInput id="annualSavings" label="Sparing" value={state.annualSavings} min={0} max={1200000} step={10000} onChange={handleStateChange} isCurrency inline />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <EyeToggle visible={showDistributionGraphic} onToggle={() => setShowDistributionGraphic(v => !v)} />
                    {showDistributionGraphic && (
                        <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col">
                            <h2 className="typo-h2 text-center text-[#4A6D8C] mb-4">Fordeling mellom aksjer og renter</h2>
                            <div className={`relative h-[260px]`}>
                                <Bar options={stackedAllYearsOptions} data={stackedAllYearsData} />
                            </div>
                        </div>
                    )}
                </div>

                {showDisclaimer && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                        onClick={() => setShowDisclaimer(false)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[80vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                aria-label="Lukk"
                                onClick={() => setShowDisclaimer(false)}
                                className="absolute top-3 right-3 text-[#333333]/70 hover:text-[#333333]"
                            >
                                ✕
                            </button>
                            <h3 className="typo-h3 text-[#4A6D8C] mb-3">Disclaimer/forutsetninger</h3>
                            <div className="typo-paragraph text-[#333333]/90 leading-8 whitespace-pre-wrap break-words px-1">
                                {(() => {
                                    const t = `Disclaimer / forutsetninger
                                



Resultatet av de beregninger som gjøres i kalkulatoren vil variere ut ifra hvilke tall som legges til grunn. Tallene som legges til grunn bestemmes i samtale mellom rådgiver og deltaker i møtet. Resultatet vil dermed kunne variere fra de tallene som fremkommer offisielle dokumenter i tilknytning til ytelse av investeringsrådgivning.

Beregningene i kalkulatoren må ansees som statiske og er kun ment for illustrasjonsformål. For konkrete fremstillinger, vises det til offisielle dokumenter knyttet til rådgivningen.

Forklaring:

Simuleringen skiller mellom privatpersoner og AS. Forskjellen ligger i beskatning av uttak. 
I hovedsak vil all skatt alltid defineres som betalbar skatt i påfølgende år. Ett uttak i f.eks år 2026, vil derfor føre til en skatteregning i år 2027 osv. 
Privat: For en privatperson vil innskutt kapital kun være knyttet til aksjedelen av porteføljen. Uttak vil derfor fordeles mellom aksjer og renter iht aksjeandelen. Om det er innskutt kapital i porteføljen, vil alle aksjeuttak fortrinnsvis hentes ut skattefritt. Når innskutt kapital er gått til null, vil alle aksjeuttak beskattes med 37,8%. 
Uttak fra renteporteføljen beskattes årlig, og uttak fra renteporteføljen er derfor ferdig beskattede midler det året de tas ut. Modellen forutsetter ingen utsatt skatt på renter. Løpende renteavkastning beskattes fortløpende hvert år, for både privat og AS. AS: 
Hendelser:
Alle innskudd vil i utgangspunktet øke den innskutte kapitalen tilsvarende.
Om dette ikke er tilfellet velger du alternativet : nei, i selve hendelsen.
Eksempel: Et AS har solgt en eiendel som øker likviditeten i selskapet, men den innskutte kapitalen i selskapet har ikke endret seg.

Alle uttak fra et as vil i modellen ansees som et utbytte. Om det er innskutt kapital i porteføljen, vil alle uttak hentes ut skattefritt. Alle uttak utover innskutt kapital vil beskattes med 37,8% i påfølgende år (se eksempel over). 
Ønsket årlig utbetaling: Summen som legges inn her er et nettobeløp. I den grad det er mulig vil modellen alltid utbetale dette beløpet etter skatt. Beløpet vil derfor med tiden øke. Dette fordi modellen tar hensyn til at det årlige uttaket må være større grunnet skatteregningen knyttet til uttaket.`;
                                    return t;
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {showAssumptionsGraphic && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                        onClick={() => setShowAssumptionsGraphic(false)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-[1200px] w-full p-10 relative max-h-[90vh] overflow-auto text-[1.25rem]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                aria-label="Lukk"
                                onClick={() => setShowAssumptionsGraphic(false)}
                                className="absolute top-3 right-3 text-[#333333]/70 hover:text-[#333333]"
                            >
                                ✕
                            </button>
                            <h3 className="typo-h3 text-[#4A6D8C] mb-6 text-[2rem]">Fordeling mellom porteføljer</h3>
                            <div className="h-[640px] bg-[#F7F7F8] rounded-xl border border-[#EEEEEE] p-6 shadow-inner">
                                <Doughnut type="doughnut" data={pieData} options={pieOptions} />
                            </div>
                        </div>
                    </div>
                )}
                
                {showAllocationChart && (
                    <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col">
                         <h2 className="typo-h2 text-center text-[#4A6D8C] mb-4">Aksjeandel over tid</h2>
                        <div className="relative h-[300px]">
                           <Line options={allocationChartOptions} data={allocationChartData} />
                        </div>
                    </div>
                )}

                <div className="relative">
                    <EyeToggle visible={showInvestedCapitalGraphic} onToggle={() => setShowInvestedCapitalGraphic(v => !v)} />
                    {showInvestedCapitalGraphic && (
                        <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col">
                            <h2 className="typo-h2 text-center text-[#4A6D8C] mb-4">Innskutt kapital over tid</h2>
                            <div className="relative h-[300px]">
                                <Bar options={capitalChartOptions} data={investedCapitalChartData} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Assumptions Panel */}
                    <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col gap-6">
                        <h2 className="typo-h2 text-[#4A6D8C]">Forutsetninger</h2>
                        <SliderInput id="investedCapital" label="Innskutt kapital (skattefri) (NOK)" value={state.investedCapital} min={0} max={state.initialPortfolioSize + state.pensionPortfolioSize} step={100000} onChange={handleStateChange} isCurrency />
                        <SliderInput id="investmentYears" label="Antall år investeringsperiode" value={state.investmentYears} min={1} max={30} step={1} onChange={handleStateChange} unit="år" />
                        <SliderInput id="payoutYears" label="Antall år med utbetaling" value={state.payoutYears} min={0} max={30} step={1} onChange={handleStateChange} unit="år" />
                         
                         {/* Ønsket årlig utbetaling */}
                         <div>
                             <h3 className="typo-h2 text-[#4A6D8C] mb-4">Ønsket årlig utbetaling</h3>
                             <div className="mt-4 space-y-4">
                                 <SliderInput 
                                     id="desiredAnnualConsumptionPayout" 
                                     label="Ønsket årlig uttak til forbruk (NOK)" 
                                     value={state.desiredAnnualConsumptionPayout} 
                                     min={0} 
                                     max={5000000} 
                                     step={50000} 
                                     onChange={handleStateChange} 
                                     isCurrency 
                                 />
                                 <SliderInput 
                                     id="desiredAnnualWealthTaxPayout" 
                                     label="Ønsket årlig uttak til formuesskatt (NOK)" 
                                     value={state.desiredAnnualWealthTaxPayout} 
                                     min={0} 
                                     max={2000000} 
                                     step={25000} 
                                     onChange={handleStateChange} 
                                     isCurrency 
                                 />
                                 <div className="bg-gray-50 border border-[#DDDDDD] rounded-lg p-3">
                                     <div className="typo-label text-[#333333]/70 mb-1">Sum ønsket årlig utbetaling (etter skatt):</div>
                                     <div className="text-lg font-semibold text-[#4A6D8C]">
                                         {formatCurrency(state.desiredAnnualConsumptionPayout + state.desiredAnnualWealthTaxPayout)}
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Parameters Panel */}
                    <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col gap-6">
                        
                        

                        

                        <div>
                            <h3 className="typo-h2 text-[#4A6D8C] mb-4">Forventet avkastning</h3>
                            <SliderInput id="stockReturnRate" label="Forventet avkastning aksjer" value={state.stockReturnRate} min={5} max={10} step={0.1} onChange={handleStateChange} displayValue={`${state.stockReturnRate.toFixed(1)}%`} />
                            <SliderInput id="bondReturnRate" label="Forventet avkastning renter" value={state.bondReturnRate} min={3} max={9} step={0.1} onChange={handleStateChange} displayValue={`${state.bondReturnRate.toFixed(1)}%`} />
                            <SliderInput id="kpiRate" label="Forventet KPI" value={state.kpiRate} min={0} max={5} step={0.1} onChange={handleStateChange} displayValue={`${state.kpiRate.toFixed(1)}%`} />

                            {/* Rådgivningshonorar knapper */}
                            <div className="mt-4">
                                <div className="typo-label text-[#333333]/80 mb-2">Rådgivningshonorar</div>
                                <div className="grid grid-cols-6 gap-2 items-center">
                                    {/* Fritekstfelt (venstre) */}
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="5"
                                            value={advisoryInputValue}
                                            onChange={(e) => setAdvisoryInputValue(e.target.value)}
                                            onBlur={(e) => handleStateChange('advisoryFeeRate', parseFloat(e.target.value) || 0)}
                                            className="w-full h-12 bg-white border border-[#DDDDDD] rounded-lg text-center text-base text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#66CCDD] focus:border-transparent pr-8"
                                        />
                                        <span className="absolute inset-y-0 right-2 flex items-center text-[#333333]/80">%</span>
                                    </div>
                                    {/* Forhåndsvalg */}
                                    {[
                                        { label: '1,37%', value: 1.37 },
                                        { label: '0,93%', value: 0.93 },
                                        { label: '0,81%', value: 0.81 },
                                        { label: '0,69%', value: 0.69 },
                                        { label: '0,57%', value: 0.57 },
                                    ].map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => {
                                                handleStateChange('advisoryFeeRate', opt.value);
                                                setAdvisoryInputValue((v) => v); // behold brukerens manuelle verdi i feltet
                                            }}
                                            className={`${state.advisoryFeeRate === opt.value ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'} h-12 rounded-lg flex items-center justify-center text-center p-1 text-sm font-medium transition-all hover:-translate-y-0.5`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Forventet avkastning felt */}
                            <div className="bg-gray-50 border border-[#DDDDDD] rounded-lg p-3 mt-4">
                                <div className="typo-label text-[#333333]/70 mb-1">Forventet avkastning:</div>
                                <div className="text-lg font-semibold text-[#4A6D8C]">
                                    {(() => {
                                        const stockAllocation = state.initialStockAllocation / 100;
                                        const bondAllocation = (100 - state.initialStockAllocation) / 100;
                                        const netStock = (state.stockReturnRate - state.kpiRate - state.advisoryFeeRate) * stockAllocation;
                                        const netBond = (state.bondReturnRate - state.kpiRate - state.advisoryFeeRate) * bondAllocation;
                                        const weightedReturn = netStock + netBond;
                                        return `${weightedReturn.toFixed(1)}%`;
                                    })()}
                                </div>
                            </div>
                        </div>
                        
                        {/* Skatt seksjon */}
                        <div className="mt-4">
                            <h3 className="typo-h2 text-[#4A6D8C] mb-4">Skatt</h3>
                            <div className="space-y-4">
                                <SliderInput id="shieldingRate" label="Skjermingsrente" value={state.shieldingRate} min={2} max={7} step={0.1} onChange={handleStateChange} displayValue={`${state.shieldingRate.toFixed(1)}%`} />
                                <ManualTaxInput id="manualStockTaxRate" label="Utbytteskatt / skatt aksjer (%)" value={state.manualStockTaxRate} onChange={handleStateChange} />
                                <ManualTaxInput id="manualBondTaxRate" label="Kapitalskatt (%)" value={state.manualBondTaxRate} onChange={handleStateChange} />
                            </div>
                        </div>
                    </div>

                    {/* Events Panel - fixed 4-slot area with controls below */}
                    <div className="bg-white border border-[#DDDDDD] rounded-xl p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <h2 className="typo-h2 text-[#4A6D8C]">Hendelser</h2>
                            <button onClick={handleAddEvent} disabled={(state.events?.length || 0) >= MAX_EVENTS} className={`flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md ${((state.events?.length || 0) >= MAX_EVENTS) ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#3388CC] hover:bg-[#005599] text-white'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                <span>Legg til hendelse</span>
                            </button>
                        </div>
                        
                        <div className="space-y-3 mt-4">
                            {(state.events.slice(0, MAX_EVENTS)).map(event => (
                                <EventRow key={event.id} event={event} onUpdate={handleUpdateEvent} onRemove={handleRemoveEvent} maxYear={maxEventYear} />
                            ))}
                            {Array.from({ length: Math.max(0, MAX_EVENTS - (state.events?.length || 0)) }).map((_, idx) => (
                                <div key={`placeholder-${idx}`} className="bg-white border border-dashed border-[#DDDDDD] rounded-lg p-4 flex items-center justify-between">
                                    <div className="text-[#333333]/60">Tom plass for hendelse</div>
                                    <button onClick={handleAddEvent} disabled={(state.events?.length || 0) >= MAX_EVENTS} className={`px-3 py-1 rounded-md text-sm font-medium ${((state.events?.length || 0) >= MAX_EVENTS) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#3388CC] text-white hover:bg-[#005599]'}`}>
                                        Legg til
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-[#EEEEEE] space-y-4">
                            <InvestorTypeToggle value={state.investorType} onChange={handleStateChange} />
                            <DeferredInterestTaxToggle value={state.deferredInterestTax} onChange={handleStateChange} investorType={state.investorType} />
                            <TaxCalculationToggle value={state.taxCalculationEnabled} onChange={handleStateChange} />
                            <ResetAllButton onReset={handleResetAll} />
                            <div>
                                <label className="typo-label text-[#333333]/80">Aksjeandel nedtrapping</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {TAPERING_OPTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => handleTaperingChange(opt.value)} className={`p-3 rounded-lg flex flex-col items-center justify-center text-center font-medium transition-all transform hover:-translate-y-0.5 ${state.taperingOption === opt.value ? 'bg-[#66CCDD] text-white shadow-lg' : 'bg-white border border-[#DDDDDD] text-[#333333] hover:bg-gray-100'}`}>
                                            <span>{opt.label}</span>
                                            <span className="text-xs text-[#333333]/70">{opt.sublabel}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

			{/* Fixed Output button */}
			<button
				onClick={handleOpenOutput}
				className="fixed bottom-4 right-4 z-50 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-700/70 hover:bg-slate-700 text-slate-200 border border-slate-600/70 shadow-sm transition-colors"
				aria-label="Output"
			>
				Output
			</button>

			{/* Output Modal */}
			{showOutputModal && (
				<div
					className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
					onClick={() => setShowOutputModal(false)}
				>
					<div
						className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[80vh] overflow-auto"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							aria-label="Lukk"
							onClick={() => setShowOutputModal(false)}
							className="absolute top-3 right-3 text-[#333333]/70 hover:text-[#333333]"
						>
							✕
						</button>
						<h3 className="typo-h3 text-[#4A6D8C] mb-4">Output</h3>
						<div className="relative">
							<textarea
								readOnly
								value={outputText}
								className="output-textarea w-full h-64 bg-white border border-[#DDDDDD] rounded-md p-3 text-[#333333] whitespace-pre-wrap break-words focus:outline-none focus:ring-2 focus:ring-[#66CCDD] focus:border-transparent pr-24"
							/>
							<button
								onClick={handleCopyOutput}
								type="button"
								className={`copy-btn absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm transition-all ${copied ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/80' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/80'}`}
							>
								{copied ? (
									<>
										{/* Check icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
										<span>Kopiert!</span>
									</>
								) : (
									<>
										{/* Copy icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
										<span>Kopier</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
        </div>
    );
}

// --- From index.tsx (Mounting logic) ---
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 
