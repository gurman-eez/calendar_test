window.addEventListener('DOMContentLoaded', () => {

	(() => {
		let calendar = (() => {
			//создаем объект с основными данными
			let obj = {
				oneDay: 86400000,
				rowTotal: 5,
				local: {
					week: [
						'Понедельник',
						'Вторник',
						'Среда',
						'Четверг',
						'Пятница',
						'Суббота',
						'Воскресенье'
					],
					day: "день",
					month: [
						'Январь',
						'Февраль',
						'Март',
						'Апрель',
						'Май',
						'Июнь',
						'Июль',
						'Август',
						'Сентябрь',
						'Октябрь',
						'Ноябрь',
						'Декабрь'
					],
					monthTo: [
						'января',
						'февраля',
						'марта',
						'апреля',
						'мая',
						'июня',
						'июля',
						'августа',
						'сентября',
						'октября',
						'ноября',
						'декабря'
					]
				},
				currentDate: {
					month: (new Date()).getMonth(),
					year: (new Date()).getFullYear()
				},
				modal: false
			};
			let Events = JSON.parse(localStorage.getItem('Events')) || [];
			

			getFirstDayMonth = (year, month) => {
				let firstDay = new Date(year, month, 1, 0, 0, 0, 0);
				return firstDay.getDay();
			}
			isModal = () => {
				if (obj.modal) {
					return true;
				}
				obj.modal = true;
				return false;
			}
			modalOff = () => {
				obj.modal = false;
				return;
			}
			//Функция для быстрого создания элемента с внутренностями и классом
			createElement = (name, text, cls) => {
				let el = document.createElement(name);
				if (text) {
					el.innerHTML = text;
				}
				if (cls) {
					el.className = cls;
				}
				return el;
			}

			initSidebar = () => {
				let sidebar = document.querySelector('#sidebar');
				let searchResults = document.querySelector('#results');
				let displayCurrent = document.querySelector('#current');
				let searchPanel = document.querySelector('#search');
				
				let clearPanel = document.querySelector('.search__close');
				displayCurrent.innerHTML = obj.local.month[obj.currentDate.month] + ' ' + obj.currentDate.year;
				//создаем обработчик событий на элементы, находящихся в шапке Sidebar
				sidebar.addEventListener('click', e => {
					//Создаем модальное окно на быстрое добавление события 
					if (e.target.id === 'add') {
						if (isModal()) {
							return;
						}
						let wrap = createElement('div', null, 'add-form');
						sidebar.append(wrap);
						let close = createElement('span', 'x', 'btn btn-close');
						//закрытие модального окна
						close.addEventListener('click', () => {
							modalOff();
							wrap.remove();
						}, false);

						let inputAdd = createElement('input', null, 'field-add');
						inputAdd.setAttribute('placeholder', '12 сентября, 00:00, День программиста');
						
						let btnCreate = createElement('button', 'Создать', 'btn-add');
						btnCreate.addEventListener('click', () => {
							if (!inputAdd.value) {
								alert('Введите "Дату, время и название события"');
								return false;
							}
							// конвертируем данные ввода для создания объекта
							let info = inputAdd.value.split(',');
							let newDay = parseInt(info[0].split(' ')[0].trim());
							let newMonth = obj.local.monthTo.indexOf(info[0].split(' ')[1].trim());
							let uid = (new Date(obj.currentDate.year, newMonth, newDay, 0, 0, 0, 0)).getTime();
							let newEvent = {
								uid: uid,
								event: info[2].trim(),
								date: info[1].trim(),
								names: '',
								description: ''
							};
							wrap.remove();
							Events.push(newEvent);
							localStorage.setItem('Events', JSON.stringify(Events)); // заносим данные в LocalStorage
							displayCurrent.innerHTML = obj.local.month[obj.currentDate.month] + ' ' + obj.currentDate.year;
							renderTable();
							modalOff();
						}, false);

						wrap.append(close);
						wrap.append(inputAdd);
						wrap.append(btnCreate);

					} else if (e.target.id === 'update') { //обновление страницы
						location.href = location.href;
					} else if (e.target.id === 'next') { // переключение месяца вперед
						obj.currentDate.month = (obj.currentDate.month > 10) ? 0 : obj.currentDate.month + 1;
						if (!obj.currentDate.month) {
							obj.currentDate.year++;
						}
						displayCurrent.innerHTML = obj.local.month[obj.currentDate.month] + ' ' + obj.currentDate.year;
						renderTable();
					} else if (e.target.id === 'prev') { // переключение месяца назад
						obj.currentDate.month = (!obj.currentDate.month) ? 11 : obj.currentDate.month - 1;
						if (obj.currentDate.month == 11) {
							obj.currentDate.year--; //уменьшение года на 1 если прошел декабрь  
						}
						displayCurrent.innerHTML = obj.local.month[obj.currentDate.month] + ' ' + obj.currentDate.year;
						renderTable();
					} else if (e.target.id === 'today') { // показывает таблицу с текущим мксяцем
						obj.currentDate = {
							month: (new Date()).getMonth(),
							year: (new Date()).getFullYear()
						};
						displayCurrent.innerHTML = obj.local.month[obj.currentDate.month] + ' ' + obj.currentDate.year;
						renderTable();
					} else if (e.target.classList.contains('search__close')) {  // закрытие поиска
						closeSearch()
					}
				}, false);

				//создания списка событий в поиске
				sidebar.addEventListener('keyup', e => {
					if (e.target.id == 'search') { // если нажали на строку поиска
						if (e.target.value.length > 0) {
							clearPanel.style.display = "block";
						} 
						let query = e.target.value.toUpperCase();
						let Ev = Events.map(data => {
							if (data) {
								return	`<div class="search__complex">
													<b>${data.event}</b>
													${(new Date(data.uid).getDate())} 
													${obj.local.monthTo[(new Date(data.uid).getMonth())]}
											</div>`;
							}
							
						});
						// Выполняем поиск
						let filterEvents = Ev.filter(e => {
							if (e) {
								return e.toUpperCase().indexOf(query) > -1;
							}
						});
						
						if (filterEvents.length > 0) {
							searchResults.style.display = 'block';
							searchResults.innerHTML = filterEvents.join('');
						} else {
							searchResults.style.display = 'none';
							searchResults.innerHTML = "";
						} 
						// показывает результат поиска
						let list = document.querySelectorAll('.search__complex');
						for (let i = 0; i < list.length; i++) {
							if (filterEvents[i]) {
								list[i].style.display = '';
							} else {
								list[i].style.display = 'none'
							}
						}
					}
				}, false);



				//закрываем модальное окно и поиск при нажатии ESC
				document.addEventListener('keyup', e => {
					if (e.code === 'Escape') {
						modalOff();
						renderTable();
						closeSearch();
					}
				});
				
				closeSearch = () => {						//закрытие поиска
					searchPanel.value = ''
					searchResults.style.display = 'none';
					searchResults.innerHTML = "";
					clearPanel.style.display = "none";
				}
			}


			
			
			// проверка на наличие класса
			hasClass = (element, cls) => {
				return (` ${element.className} `).indexOf(` ${cls} `) > -1;
			}

			renderTable = () => {   // отрисовка таблицы
				let container, div, table, tbody, tr;
				let months = [];
				let aDay;
				// создаем таблицу
				container = document.querySelector("#calendar-table");
				container.innerHTML = '';
				div = createElement('div', null, 'td');
				container.append(div);

				table = createElement('table');
				div.append(table);
				tbody = createElement('tbody');
				table.append(tbody);

				// отрисовка таблицы
				// отсчет начинаем с первого календарного дня месяца
				let fDay = getFirstDayMonth(obj.currentDate.year, obj.currentDate.month);
				let fDayTS = new Date(obj.currentDate.year, obj.currentDate.month, 1, 0, 0, 0, 0).getTime();

				// вычисляем timestamp выпадающий на понедельник
				aDay = fDayTS - (obj.oneDay * (fDay - 1));

				for (let row = 0; row < obj.rowTotal; row++) {
					tr = createElement('tr');
					tbody.append(tr)
					for (let col = 0; col < 7; col++) {
						let td;
						if (row == 0) {
							//заполняем шапку календаря днями недели
							td = createElement('td', obj.local.week[col] + ", " + (new Date(aDay)).getDate());
						} else {
							// заполняем тело календаря
							if (row == 1 && col == 0) {
								months[0] = (new Date(aDay)).getMonth() + 1;
							} else if (row == obj.rowTotal - 1 && col == 6) {
								months[1] = (new Date(aDay)).getMonth() + 1;
								if (months[0] == months[1]) {
									months.pop();
								}
							}
							td = createElement('td', new Date(aDay).getDate());
						}
						if (aDay < Date.now() - obj.oneDay) {
							td.className = "last";
						}

						Events.forEach(event => {
							if (!!event && parseInt(event.uid) == aDay) {
								td.className = "active";
								if (aDay < Date.now() - obj.oneDay) {
									td.className = "last active";
								}
								//верстка ячейки таблицы
								td.innerHTML += `<br/><b>${event.event}     
												</b><br/>${event.date}
												<br/>${event.names}
												<br/><br/>${event.description}<br/>`;
							}
						});

						td.setAttribute('data-day', aDay);
						td.addEventListener("click", function (e) { // 'Function' потому что контекст вызова

							if (isModal()) {
								modalOff();
								renderTable();
								return;
							}

							let el = e.target;
							if (hasClass(el, 'active') || hasClass(el, 'last active')) {
								// редактирование ячейки
								el.className = "active edit";
								let uid = parseInt(el.getAttribute('data-day'));
								let data;
								Events.forEach(event => {
									if (event && event.uid == uid) {
										data = event;
									}
								});
								// создание модального окна на редактирование события
								let wrap = createElement('div', null, 'add-form-edit');
								document.querySelector('#calendar-table').append(wrap);
								wrap.style.left = `${this.offsetLeft + 130}px`;
								wrap.style.top = `${this.offsetTop - 20}px`;

								let close = createElement('span', 'x', 'btn btn-close');
								close.addEventListener('click', () => {
									modalOff();
									el.className = "active";
									wrap.remove();
								}, false);

								let btnClean = createElement('button', 'Удалить', 'btn-clean');
								btnClean.addEventListener('click', () => {  // удаление модального окна
									modalOff();
									wrap.remove();
									el.innerHTML = (new Date(data.uid)).getDate();
									el.removeAttribute('class');

									Events.forEach((event, i) => {
										if (!!event && data.uid == event.uid) {
											delete Events[i];
										}
									});
									localStorage.setItem('Events', JSON.stringify(Events)); // заносим данные в LocalStorage
								}, false);

								// создание модального окна на редактирование события
								let fieldEvent = createElement('h3', data.event),
									fieldDate = createElement('p', `<span>${data.date}</span>`),
									fieldName = createElement('p', `Участники:<br/>
																			<span>${data.names}</span>`),
									fieldDescription = createElement('textarea', null, 'field-description');

								fieldDescription.value = data.description;

								let btn = createElement('button', 'Готово', 'btn-add');
								btn.addEventListener('click', () => {
									modalOff();
									data.description = fieldDescription.value;
									el.className = "active";
									el.innerHTML = `${(new Date(uid)).getDate()}<br/><b>
													${data.event}
													</b><br/>${data.date}
													<br/>${data.names}
													<br/><br/>${data.description}<br/>`;
									Events.forEach((event, i) => {
										if (!!event && data.uid == event.uid) {
											Events[i] = data;
										}
									});
									localStorage.setItem('Events', JSON.stringify(Events)); // заносим данные в LocalStorage
									wrap.remove();
								}, false);

								wrap.append(close);
								wrap.append(fieldEvent);
								wrap.append(fieldDate);
								wrap.append(fieldName);
								wrap.append(fieldDescription);
								wrap.append(btn);
								wrap.append(btnClean);
							} else {
								if (hasClass(el, 'last')) {
									modalOff();
									return;
								}
								// создание модального окна на запись нового события
								let wrap = createElement('div', null, 'add-form-advanced');
								document.querySelector('#calendar-table').append(wrap);
								wrap.style.left = `${this.offsetLeft + 130}px`;
								wrap.style.top = `${this.offsetTop - 20}px`;

								let close = createElement('span', 'x', 'btn btn-close');
								close.addEventListener('click', () => {
									modalOff();
									wrap.remove();
								}, false);

								let btnDone = createElement('button', 'Готово', 'btn-add'),
									btnClean = createElement('button', 'Удалить', 'btn-clean'),
									fieldUID = createElement('input');

								fieldUID.setAttribute('type', 'hidden');
								fieldUID.value = el.getAttribute('data-day');

								let fieldEvent = createElement('input', null, 'field-add');
								fieldEvent.setAttribute('placeholder', 'Событие');

								let fieldDate = createElement('input', null, 'field-date');
								fieldDate.setAttribute('placeholder', 'Время события (формата ХХ:ХХ) ');

								let fieldName = createElement('input', null, 'field-name');
								fieldName.setAttribute('placeholder', 'Имена участников');

								let fieldDescription = createElement('textarea', null, 'field-description');
								fieldDescription.setAttribute('placeholder', 'Описание');

								btnDone.addEventListener('click', () => {
									let timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // проверка на ввод времени в формате XX:XX
									if (fieldEvent.value == '' || !(timeFormat.test(fieldDate.value)) || fieldName.value == '') {
										modalOff();
										wrap.remove();
									} else {
										let data = {
											uid: parseInt(fieldUID.value),
											event: fieldEvent.value,
											date: fieldDate.value,
											names: fieldName.value,
											description: fieldDescription.value
										};
										modalOff();
										Events.push(data);
										localStorage.setItem('Events', JSON.stringify(Events)); // заносим данные в LocalStorage
										wrap.remove();
										renderTable();
									}
								}, false);

								wrap.append(close);
								wrap.append(fieldEvent);
								wrap.append(fieldDate);
								wrap.append(fieldName);
								wrap.append(fieldDescription);
								wrap.append(btnDone);
								wrap.append(btnClean);
							}
						}, false);
						tr.append(td);
						aDay += obj.oneDay;
					}
				}
			}
			init = () => {  // вызываем 2 вышеупомянутые функции
				initSidebar();
				renderTable();
			}

			return {
				do: () => { // возвращаем как свойство обьекта 'Calendar'
					init();
				}
			}
		})();
		calendar.do(); //вызываем свойство обьекта
	})();










})