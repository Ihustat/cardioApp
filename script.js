'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');
class App {

    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));
        
        inputType.addEventListener('change', this._toggleClimbField);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
                 () =>  {
                alert('Невозможно получить ваше мостоположение');
            });
        };
    }

    _loadMap(position) {
        const {latitude, longitude} = position.coords;

        const coords = [latitude, longitude]
    
        this.#map = L.map('map').setView(coords, 13);
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
    
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(e) {
        this.#mapEvent = e;
    
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        form.classList.add('hidden');
        inputDuration.value = inputDistance.value = inputTemp.value = inputClimb.value = '';
    }

    _toggleClimbField() {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {

        function areNumbers(...numbers) {
            numbers.every(num => Number.isFinite(num));
        };

        function arePositiveNumbers(...numbers) {
            numbers.every(num => num > 0);
        };


        e.preventDefault();

        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        //get data from form

        const type = inputType.value,
              distance = +inputDistance.value,
              duration = +inputDuration.value;


        //check training type

        if (type === 'running') {
            const temp = +inputTemp.value;
            //valid data
            if (areNumbers(distance, duration, temp) || arePositiveNumbers(distance, duration, temp)) return;

            //create workout

            workout = new Running([lat, lng], distance, duration, temp);
        };

        if (type === 'cycling') {
            const climb = +inputClimb.value;
            //valid data
            if (areNumbers(distance, duration, climb) || arePositiveNumbers(distance, duration)) return;

            workout = new Cycling([lat, lng], distance, duration, climb);
        };

        //add workout in workouts array

        this.#workouts.push(workout);

        //hide form and clean inputs
        this._hideForm();
    
        //show workout on map
       this._displayWorkout(workout);

       //show workout in list
        this._displayWorkoutOnSidebar(workout);
    }

    _displayWorkout(workout) {
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            })
            )
        .setPopupContent(`${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.description}`)
        .openPopup();
    }

    _displayWorkoutOnSidebar(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃' : '🚵‍♂️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">мин</span>
          </div>`;

        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                <span class="workout__icon">📏⏱</span>
                <span class="workout__value">${workout.pace.toFixed(2)}</span>
                <span class="workout__unit">м/мин</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">👟⏱</span>
                <span class="workout__value">${workout.temp}</span>
                <span class="workout__unit">шаг/мин</span>
            </div>
            </li>`;
        };

        if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                <span class="workout__icon">📏⏱</span>
                <span class="workout__value">${workout.speed.toFixed(2)}</span>
                <span class="workout__unit">км/ч</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🏔</span>
                <span class="workout__value">${workout.climb}</span>
                <span class="workout__unit">м</span>
            </div>
            </li>`;
        };

        form.insertAdjacentHTML('afterend', html);
    }
};

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {
        this.type === 'running' ? this.description = `Пробежка ${new Intl.DateTimeFormat('ru-Ru').format(this.date)}` : this.description = `Велотренировка ${new Intl.DateTimeFormat('ru-Ru').format(this.date)}`;
    }
};

class Running extends Workout {

    type = 'running';

    constructor(coords, distance, duration, temp) {
        super(coords, distance, duration);
        this.temp = temp;
        this.calculatePace();
        this._setDescription();
    }

    calculatePace() {
        this.pace = this.duration / this.distance;
    }
};

class Cycling extends Workout {
    
    type = 'cycling';

    constructor(coords, distance, duration, climb) {
        super(coords, distance, duration);
        this.climb = climb;
        this.calculateSpeed();
        this._setDescription();
    }

    calculateSpeed() {
        this.speed = this.distance / this.duration / 60;
    }
};

const app = new App();

