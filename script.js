let studyHours = Number(localStorage.getItem("studyHours")) || 0;

function addStudyHours() {

    let input = document.getElementById("study-input");

    let hours = Number(input.value);

    if (hours <= 0 || !Number.isFinite(hours) || hours > 20) {
        alert("Please enter a valid number of hours!");
        return;
    }

    studyHours += hours;
    localStorage.setItem("studyHours", studyHours);

    document.getElementById("study-total").textContent =
        studyHours + " / 20 hours";

    let progress = (studyHours / 20) * 100;

    document.getElementById("study-progress").style.width =
        Math.min(progress, 100) + "%";

    input.value = "";
}
document.getElementById("study-total").textContent =
    studyHours + " / 20 hours";

document.getElementById("study-progress").style.width =
    Math.min((studyHours / 20) * 100, 100) + "%";
let db;

const request = indexedDB.open("DaydreamDatabase", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    db.createObjectStore("photos", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = function(event) {
    db = event.target.result;
    displayPhotos();
};

request.onerror = function() {
    console.log("Database could not be opened");
};
function addPhotos() {
    const files = document.getElementById("photo-input").files;
    const caption = document.getElementById("photo-caption").value;
    const date = document.getElementById("photo-date").value;

    if (files.length === 0) {
        alert("Choose at least one photo first!");
        return;
    }
    if (!date) {
        alert("Choose a date for your memory!");
        return;
    }

    const transaction = db.transaction(["photos"], "readwrite");
    const store = transaction.objectStore("photos");

    for (let file of files) {
        const photo = {
            image: file,
            caption: caption,
            date: date
        };

        store.add(photo);
    }

    transaction.oncomplete = function() {
        document.getElementById("photo-input").value = "";
        document.getElementById("photo-caption").value = "";
        document.getElementById("photo-date").value = "";
        displayPhotos();
    };
}
function displayPhotos() {
    const gallery = document.getElementById("photo-gallery");
    gallery.innerHTML = "";

    const transaction = db.transaction(["photos"], "readonly");
    const store = transaction.objectStore("photos");

    const request = store.getAll();

    request.onsuccess = function() {
        const photos = request.result;

        const groupedPhotos = {};

        photos.forEach(photo => {
            if (!groupedPhotos[photo.date]) {
                groupedPhotos[photo.date] = [];
            }

            groupedPhotos[photo.date].push(photo);
        });

        Object.keys(groupedPhotos).sort((a, b) => b.localeCompare(a)).forEach(date => {

            const section = document.createElement("div");
            section.className = "memory-date-section";

            const heading = document.createElement("h3");
            heading.textContent = date;

            const grid = document.createElement("div");
            grid.className = "photo-gallery";

            groupedPhotos[date].forEach(photo => {
                const card = document.createElement("div");
                card.className = "memory-card";

                const image = document.createElement("img");
                image.src = URL.createObjectURL(photo.image);

                const caption = document.createElement("p");
                caption.textContent = photo.caption || "a little memory ♡";

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Remove memory";
                deleteButton.onclick = function() {

                    deletePhoto(photo.id);
                };
                card.appendChild(image);
                card.appendChild(caption);
                card.appendChild(deleteButton);
                grid.appendChild(card);
            });

            section.appendChild(heading);
            section.appendChild(grid);

            gallery.appendChild(section);
        });
    };
}
function deletePhoto(id) {
    if (!confirm("Are you sure you want to remove this memory? ♡")) {
    return;
    }

    const transaction = db.transaction(["photos"], "readwrite");
    const store = transaction.objectStore("photos");

    store.delete(id);

    transaction.oncomplete = function() {
        displayPhotos();
    };
}

const weeklySchedule = {
    Monday: [
        { time: "2:55 PM – 3:45 PM", subject: "Computation Structures", type: "Theory" },
        { time: "3:50 PM – 4:40 PM", subject: "Fashion Psychology", type: "" },
        { time: "4:45 PM – 5:35 PM", subject: "Probability and Statistics", type: "" },
        { time: "5:40 PM – 6:30 PM", subject: "Macroeconomics", type: "" }
    ],

    Tuesday: [
        { time: "8:00 AM – 9:40 AM", subject: "Computation Structures", type: "Lab" },
        { time: "9:50 AM – 11:30 AM", subject: "OOPS", type: "Lab" },
        { time: "2:00 PM – 2:50 PM", subject: "Probability and Statistics", type: "" },
        { time: "2:55 PM – 3:45 PM", subject: "Macroeconomics", type: "" },
        { time: "3:50 PM – 4:40 PM", subject: "Chemistry", type: "" },
        { time: "5:40 PM – 7:20 PM", subject: "Spanish", type: "Lab" }
    ],

    Wednesday: [
        { time: "8:00 AM – 9:40 AM", subject: "Chemistry", type: "Lab" },
        { time: "9:50 AM – 11:30 AM", subject: "MATLAB", type: "" },
        { time: "2:00 PM – 2:50 PM", subject: "OOPS", type: "Theory" },
        { time: "3:50 PM – 4:40 PM", subject: "Computation Structures", type: "" },
        { time: "4:45 PM – 5:35 PM", subject: "Fashion Psychology", type: "" }
    ],

    Thursday: [
        { time: "9:50 AM – 11:30 AM", subject: "OOPS", type: "Lab" },
        { time: "2:00 PM – 2:50 PM", subject: "Fashion Psychology", type: "" },
        { time: "2:55 PM – 3:45 PM", subject: "Probability and Statistics", type: "" },
        { time: "3:50 PM – 4:40 PM", subject: "Macroeconomics", type: "" },
        { time: "4:45 PM – 5:35 PM", subject: "Chemistry", type: "" }
    ],

    Friday: [
        { time: "9:50 AM – 10:40 AM", subject: "Spanish", type: "" },
        { time: "2:00 PM – 2:50 PM", subject: "Chemistry", type: "" },
        { time: "2:50 PM – 3:40 PM", subject: "OOPS", type: "Theory" },
        { time: "4:45 PM – 5:35 PM", subject: "Computation Structures", type: "Theory" },
        { time: "5:40 PM – 6:30 PM", subject: "Fashion Psychology", type: "" }
    ],

    Saturday: [],
    Sunday: []
};


function showDay(day) {
    const schedule = document.getElementById("schedule-list");
    schedule.innerHTML = "";

    const classes = weeklySchedule[day];

    if (classes.length === 0) {
        schedule.textContent = "No classes scheduled. Enjoy your day ♡";
        return;
    }

    classes.forEach(classItem => {
        const item = document.createElement("div");
        item.className = "schedule-item";

        const time = document.createElement("p");
        time.textContent = classItem.time;

        const subject = document.createElement("h3");
        subject.textContent = classItem.subject;

        const type = document.createElement("small");
        type.textContent = classItem.type;

        item.appendChild(time);
        item.appendChild(subject);

        if (classItem.type) {
            item.appendChild(type);
        }

        schedule.appendChild(item);
    });
}

// STUDY DIARY ♡

let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function showStudyMode(mode) {
    document.getElementById("timer-section").style.display =
        mode === "timer" ? "block" : "none";

    document.getElementById("manual-section").style.display =
        mode === "manual" ? "block" : "none";
}

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;

    document.getElementById("timer-display").textContent =
        [hours, minutes, seconds]
        .map(value => String(value).padStart(2, "0"))
        .join(":");
}

function startTimer() {
    if (timerRunning) return;

    const subject = document.getElementById("timer-subject").value;

    if (!subject) {
        alert("Choose a subject first ♡");
        return;
    }

    timerRunning = true;

    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function finishTimer() {
    pauseTimer();

    if (timerSeconds === 0) {
        alert("Study for a little while first ♡");
        return;
    }

    const subject = document.getElementById("timer-subject").value;
    const hours = timerSeconds / 3600;

    saveStudySession(subject, hours, "Timer session");

    timerSeconds = 0;
    updateTimerDisplay();

    alert("Session saved! Lovely work ♡");
}

// STUDY SESSION STORAGE ♡

let studySessions = JSON.parse(
    localStorage.getItem("studySessions") || "[]"
);

function saveStudySession(subject, hours, note) {
    if (!subject || !hours || hours <= 0) return;

    const session = {
        subject: subject,
        hours: hours,
        note: note,
        date: new Date().toLocaleDateString()
    };

    studySessions.unshift(session);

    localStorage.setItem(
        "studySessions",
        JSON.stringify(studySessions)
    );

    renderStudyHistory();
    updateStudyProgress();
    updateSubjectAnalytics();
}

function addManualSession() {
    const subject = document.getElementById("manual-subject").value;
    const hours = Number(
        document.getElementById("manual-hours").value
    );
    const note = document.getElementById("study-note").value;

    if (!subject || !hours || hours <= 0) {
        alert("Please enter a subject and valid study hours ♡");
        return;
    }

    saveStudySession(subject, hours, note);

    document.getElementById("manual-hours").value = "";
    document.getElementById("study-note").value = "";

    alert("Your study session has been saved ♡");
}

function renderStudyHistory() {
    const history = document.getElementById("study-history-list");

    history.innerHTML = "";

    if (studySessions.length === 0) {
        history.textContent = "Your study journey starts here ♡";
        return;
    }

    studySessions.forEach(session => {
        const item = document.createElement("div");
        item.className = "study-session-item";

        const subject = document.createElement("h4");
        subject.textContent = session.subject;

        const duration = document.createElement("p");
        duration.textContent = session.hours.toFixed(2) + " hours";

        const date = document.createElement("small");
        date.textContent = session.date;

        const note = document.createElement("p");
        note.textContent = session.note || "";

        item.append(subject, duration, date, note);
        history.appendChild(item);
    });
}

// WEEKLY STUDY PROGRESS ♡

function updateStudyProgress() {
    const now = new Date();

    const monday = new Date(now);
    const day = monday.getDay();

    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const weeklyHours = studySessions.reduce((total, session) => {
        const parts = session.date.split("/");
        const sessionDate = new Date(
            parts[2],
            parts[1] - 1,
            parts[0]
        );

        if (sessionDate >= monday && sessionDate <= now) {
            return total + session.hours;
        }

        return total;
    }, 0);

    document.getElementById("study-total").textContent =
        weeklyHours.toFixed(1) + " / 20 hours";

    document.getElementById("study-progress").style.width =
        Math.min((weeklyHours / 20) * 100, 100) + "%";
}

renderStudyHistory();
updateStudyProgress();

function updateSubjectAnalytics() {
    const breakdown = {};

    studySessions.forEach(session => {
        breakdown[session.subject] =
            (breakdown[session.subject] || 0) + session.hours;
    });

    const subjects = Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1]);

    document.getElementById("subject-count").textContent =
        subjects.length;

    document.getElementById("top-subject").textContent =
        subjects.length ? subjects[0][0] : "—";

    const container = document.getElementById("subject-breakdown");
    container.innerHTML = "";

    subjects.forEach(([subject, hours]) => {
        const item = document.createElement("div");
        item.className = "subject-item";

        const heading = document.createElement("div");
        heading.className = "subject-heading";

        const name = document.createElement("span");
        name.textContent = subject;

        const duration = document.createElement("span");
        duration.textContent = hours.toFixed(1) + " hrs";

        heading.append(name, duration);

        const bar = document.createElement("div");
        bar.className = "subject-bar";

        const fill = document.createElement("div");
        fill.className = "subject-fill";

        const percentage = (hours / subjects[0][1]) * 100;
        fill.style.width = percentage + "%";

        bar.appendChild(fill);
        item.append(heading, bar);

        container.appendChild(item);
    });
}

updateSubjectAnalytics();

// MY PLANNER ♡

let plannerTasks = JSON.parse(
    localStorage.getItem("plannerTasks") || "[]"
);

const taskDateInput = document.getElementById("task-date");

taskDateInput.value = new Date().toLocaleDateString("en-CA");

function addTask() {

    const name = document.getElementById("task-name").value.trim();
    const date = taskDateInput.value;
    const priority = document.getElementById("task-priority").value;
    const category = document.getElementById("task-category").value;

    if (!name || !date) {
        alert("Add a task and choose a date ♡");
        return;
    }

    plannerTasks.push({
        id: Date.now() + Math.random(),
        name,
        date,
        priority,
        category,
        completed: false
    });

    localStorage.setItem("plannerTasks", JSON.stringify(plannerTasks));

    document.getElementById("task-name").value = "";

    renderPlanner();
    renderCalendar();
}

function toggleTask(id) {

    plannerTasks = plannerTasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    localStorage.setItem("plannerTasks", JSON.stringify(plannerTasks));

    renderPlanner();
}

function deleteTask(id) {

    plannerTasks = plannerTasks.filter(task => task.id !== id);

    localStorage.setItem("plannerTasks", JSON.stringify(plannerTasks));

    renderPlanner();
}

function renderPlanner() {

    const dailyList = document.getElementById("task-list");
    const weeklyList = document.getElementById("weekly-task-list");

    dailyList.innerHTML = "";
    weeklyList.innerHTML = "";

    const selectedDate = taskDateInput.value;

    const dailyTasks = plannerTasks.filter(task =>
        task.date === selectedDate
    );

    if (dailyTasks.length === 0) {
        dailyList.textContent = "A fresh day, a fresh start ♡";
    }

    dailyTasks.forEach(task => {
        dailyList.appendChild(createTaskCard(task));
    });

    const selected = new Date(selectedDate + "T12:00:00");
    const monday = new Date(selected);
    const day = monday.getDay();

    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklyTasks = plannerTasks.filter(task => {
        const date = new Date(task.date + "T12:00:00");
        return date >= monday && date <= sunday;
    });

    if (weeklyTasks.length === 0) {
        weeklyList.textContent = "Your week is waiting to be planned ♡";
    }

    weeklyTasks.forEach(task => {
        const wrapper = document.createElement("div");
        wrapper.className = "weekly-task";

        const date = document.createElement("small");
        date.textContent = task.date;

        wrapper.append(date, createTaskCard(task));
        weeklyList.appendChild(wrapper);
    });
}

function createTaskCard(task) {

    const card = document.createElement("div");
    card.className = "task-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTask(task.id);

    const details = document.createElement("div");
    details.className = "task-details";

    const name = document.createElement("p");
    name.textContent = task.name;

    if (task.completed) {
        name.classList.add("completed-task");
    }

    const info = document.createElement("small");
    info.textContent = task.category + " · " + task.priority + " priority";

    const remove = document.createElement("button");
    remove.textContent = "×";
    remove.onclick = () => deleteTask(task.id);

    details.append(name, info);
    card.append(checkbox, details, remove);

    return card;
}

taskDateInput.addEventListener("change", renderPlanner);

renderPlanner();

// CALENDAR ♡

let calendarDate = new Date();
let selectedCalendarDate = null;

function renderCalendar() {

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthName = calendarDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    document.getElementById("calendar-month").textContent = monthName;

    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";

    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    weekdays.forEach(day => {
        const heading = document.createElement("div");
        heading.className = "calendar-weekday";
        heading.textContent = day;
        grid.appendChild(heading);
    });

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startingDay = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < startingDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);
        const dateString = [
            year,
            String(month + 1).padStart(2, "0"),
            String(day).padStart(2, "0")
        ].join("-");

        const tasks = plannerTasks.filter(task =>
            task.date === dateString
        );

        const cell = document.createElement("button");
        cell.className = "calendar-day";
        cell.textContent = day;

        const today = new Date();

        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            cell.classList.add("today");
        }

        if (tasks.length > 0) {
            cell.classList.add("has-tasks");
        }

        if (selectedCalendarDate === dateString) {
            cell.classList.add("selected");
        }

        cell.onclick = () => selectCalendarDate(dateString);

        grid.appendChild(cell);
    }

    if (selectedCalendarDate) {
        showCalendarTasks(selectedCalendarDate);
    }
}

function changeMonth(direction) {

    calendarDate.setMonth(
        calendarDate.getMonth() + direction
    );

    renderCalendar();
}

function selectCalendarDate(dateString) {

    selectedCalendarDate = dateString;

    renderCalendar();
    showCalendarTasks(dateString);
}

function showCalendarTasks(dateString) {

    const date = new Date(dateString + "T12:00:00");

    document.getElementById("selected-date-title").textContent =
        date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    const container = document.getElementById("calendar-tasks");
    container.innerHTML = "";

    const tasks = plannerTasks.filter(task =>
        task.date === dateString
    );

    if (tasks.length === 0) {
        container.textContent = "Nothing planned. Enjoy the little moments ♡";
        return;
    }

    tasks.forEach(task => {

        const item = document.createElement("div");
        item.className = "calendar-task";

        const name = document.createElement("p");
        name.textContent = task.name;

        const category = document.createElement("small");
        category.textContent =
            task.category + " · " + task.priority + " priority";

        item.append(name, category);
        container.appendChild(item);
    });
}

renderCalendar();

// DEADLINE TRACKER ♡

let deadlines = JSON.parse(
    localStorage.getItem("deadlines") || "[]"
);

function addDeadline() {

    const title = document.getElementById("deadline-title").value.trim();
    const subject = document.getElementById("deadline-subject").value;
    const type = document.getElementById("deadline-type").value;
    const date = document.getElementById("deadline-date").value;
    const priority = document.getElementById("deadline-priority").value;

    if (!title || !subject || !date) {
        alert("Please fill in all the required details ♡");
        return;
    }

    const deadlineDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
        alert("Please choose today or a future date ♡");
        return;
    }

    deadlines.push({
        id: Date.now() + Math.random(),
        title,
        subject,
        type,
        date,
        priority,
        completed: false
    });

    localStorage.setItem("deadlines", JSON.stringify(deadlines));

    document.getElementById("deadline-title").value = "";
    document.getElementById("deadline-subject").value = "";
    document.getElementById("deadline-date").value = "";

    renderDeadlines();
}

function completeDeadline(id) {

    deadlines = deadlines.map(item =>
        item.id === id
            ? { ...item, completed: !item.completed }
            : item
    );

    localStorage.setItem("deadlines", JSON.stringify(deadlines));

    renderDeadlines();
}

function deleteDeadline(id) {

    deadlines = deadlines.filter(item => item.id !== id);

    localStorage.setItem("deadlines", JSON.stringify(deadlines));

    renderDeadlines();
}

function renderDeadlines() {

    const upcoming = document.getElementById("upcoming-deadlines");
    const completed = document.getElementById("completed-deadlines");

    upcoming.innerHTML = "";
    completed.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sorted = [...deadlines].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    sorted.forEach(item => {

        const card = document.createElement("div");
        card.className = "deadline-card";

        const info = document.createElement("div");
        info.className = "deadline-info";

        const title = document.createElement("h4");
        title.textContent = item.title;

        const subject = document.createElement("p");
        subject.textContent = item.subject + " · " + item.type;

        const date = new Date(item.date + "T00:00:00");

        const diff = Math.ceil(
            (date.getTime() - today.getTime()) / 86400000
        );

        const countdown = document.createElement("small");

        if (diff === 0) {
            countdown.textContent = "Due today";
        } else if (diff === 1) {
            countdown.textContent = "Due tomorrow";
        } else {
            countdown.textContent = diff + " days left";
        }

        const priority = document.createElement("small");
        priority.textContent = item.priority + " priority";

        info.append(title, subject, countdown, priority);

        const actions = document.createElement("div");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.completed;
        checkbox.title = "Mark as completed";
        checkbox.onchange = () => completeDeadline(item.id);

        const remove = document.createElement("button");
        remove.textContent = "×";
        remove.onclick = () => deleteDeadline(item.id);

        actions.append(checkbox, remove);

        card.append(info, actions);

        if (item.completed) {
            completed.appendChild(card);
        } else {
            upcoming.appendChild(card);
        }
    });

    if (!deadlines.some(item => !item.completed)) {
        upcoming.textContent = "Nothing pending. You're doing amazing ♡";
    }

    if (!deadlines.some(item => item.completed)) {
        completed.textContent = "Your completed work will appear here ♡";
    }
    renderReminders();
}

renderDeadlines();
// DAILY HABITS ♡

let habits = JSON.parse(localStorage.getItem("habits") || "[]");

let habitDate = new Date().toLocaleDateString();

function addHabit() {
    const input = document.getElementById("habit-name");
    const name = input.value.trim();

    if (!name) {
        alert("Please enter a habit first ♡");
        return;
    }

    habits.push({
        id: Date.now() + Math.random(),
        name: name,
        completed: false,
        date: habitDate
    });

    localStorage.setItem("habits", JSON.stringify(habits));

    input.value = "";
    renderHabits();
}

function toggleHabit(id) {
    habits = habits.map(habit =>
        habit.id === id
            ? { ...habit, completed: !habit.completed }
            : habit
    );

    localStorage.setItem("habits", JSON.stringify(habits));
    renderHabits();
}

function deleteHabit(id) {
    habits = habits.filter(habit => habit.id !== id);

    localStorage.setItem("habits", JSON.stringify(habits));
    renderHabits();
}

function renderHabits() {
    const list = document.getElementById("habit-list");
    const progressText = document.getElementById("habit-progress-text");
    const progressFill = document.getElementById("habit-progress-fill");

    const today = new Date().toLocaleDateString();

    habits = habits.map(habit => {
        if (habit.date !== today) {
            return {
                ...habit,
                completed: false,
                date: today
            };
        }
        return habit;
    });

    habitDate = today;

    localStorage.setItem("habits", JSON.stringify(habits));

    list.innerHTML = "";

    const completed = habits.filter(habit => habit.completed).length;
    const total = habits.length;

    progressText.textContent = `${completed} of ${total} habits completed`;

    const percentage = total === 0 ? 0 : (completed / total) * 100;
    progressFill.style.width = percentage + "%";

    if (total === 0) {
        list.textContent = "Your little habits will appear here ♡";
        return;
    }

    habits.forEach(habit => {
        const card = document.createElement("div");
        card.className = "habit-card";

        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = habit.completed;
        checkbox.onchange = () => toggleHabit(habit.id);

        const name = document.createElement("span");
        name.textContent = habit.name;

        if (habit.completed) {
            name.classList.add("habit-done");
        }

        label.append(checkbox, name);

        const remove = document.createElement("button");
        remove.textContent = "×";
        remove.onclick = () => deleteHabit(habit.id);

        card.append(label, remove);
        list.appendChild(card);
    });
}

renderHabits();

// REMINDERS ♡

function renderReminders() {
    const reminderList = document.getElementById("reminder-list");

    reminderList.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = deadlines
        .filter(item => !item.completed && item.date)
        .map(item => ({
            ...item,
            daysLeft: Math.ceil(
                (new Date(item.date + "T00:00:00") - today) / 86400000
            )
        }))
        .filter(item => item.daysLeft >= 0)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5);

    if (upcoming.length === 0) {
        reminderList.textContent = "Nothing urgent right now. Enjoy your day ♡";
        return;
    }

    upcoming.forEach(item => {
        const card = document.createElement("div");
        card.className = "reminder-card";

        const title = document.createElement("h3");
        title.textContent = item.title;

        const detail = document.createElement("p");
        detail.textContent = item.subject + " · " + item.type;

        const countdown = document.createElement("small");
        countdown.textContent =
            item.daysLeft === 0 ? "Due today!" :
            item.daysLeft === 1 ? "Due tomorrow!" :
            `${item.daysLeft} days left`;

        card.append(title, detail, countdown);
        reminderList.appendChild(card);
    });
}

renderReminders();
// PAGE NAVIGATION ♡

function showPage(pageId, button) {
    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Update active navigation button
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }
}