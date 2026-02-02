let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function formatDateToISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendarHeader() {
    // Update month label
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    const label = document.getElementById('current-month-label');
    if (label) label.textContent = monthName;

    const headerRow = document.getElementById('calendar-header-row');
    if (!headerRow) return;

    // Clear existing dynamic columns (keep the first sticky column)
    while (headerRow.children.length > 1) {
        headerRow.removeChild(headerRow.lastChild);
    }
    
    const totalDays = getDaysInMonth(currentYear, currentMonth);
    const dayNames = ['S','M','T','W','T','F','S'];
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
    const todayDate = today.getDate();

    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const weekday = dayNames[date.getDay()];
        const isToday = isCurrentMonth && i === todayDate;

        const th = document.createElement('th');
        th.className = `habit-grid-cell border-r border-border-dark/50 p-0 ${isToday ? 'bg-day-highlight/40 border-x-2 border-day-highlight' : ''}`;
        th.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full py-2">
                <span class="text-[10px] font-black text-accent-grey">${weekday}</span>
                <span class="text-xs font-black ${isToday ? 'text-white' : 'text-neutral-500'}">${i}</span>
            </div>
        `;
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
