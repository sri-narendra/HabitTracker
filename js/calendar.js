let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function formatDateToISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendarHeader() {
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-month-name').textContent = monthName;

    const headerRow = document.getElementById('calendar-header-row');
    headerRow.innerHTML = '<th>Habit</th>';
    
    const days = getDaysInMonth(currentYear, currentMonth);
    for (let i = 1; i <= days; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        th.style.textAlign = 'center';
        th.style.width = '30px';
        headerRow.appendChild(th);
    }
}

function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendarHeader();
    window.loadHabits(); // In habits.js
}

window.calendar = {
    getYear: () => currentYear,
    getMonth: () => currentMonth,
    getDays: () => getDaysInMonth(currentYear, currentMonth),
    formatDate: formatDateToISO,
    init: renderCalendarHeader
};
