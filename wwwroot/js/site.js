window.onload = function () {
    $('[data-toggle="tooltip"]').tooltip();

    function formatDate(date) {
        return (
            date.getDate() +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getFullYear()
        );
    }

    var currentDate = formatDate(new Date());

    $(".due-date-button").datepicker({
        format: "dd/mm/yyyy",
        autoclose: true,
        todayHighlight: true,
        startDate: currentDate,
        orientation: "bottom right"
    });

    $(".due-date-button").on("click", function (event) {
        $(".due-date-button")
            .datepicker("show")
            .on("changeDate", function (dateChangeEvent) {
                $(".due-date-button").datepicker("hide");
                $(".due-date-label").text(formatDate(dateChangeEvent.date));
            });
    });
};

const uri = 'api/TodoItems';
let todos = [];

function getItems(isInitial, loadInDOM) {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data, isInitial, loadInDOM))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const addNameTextbox = document.getElementById('add-name');

    const item = {
        isComplete: false,
        name: addNameTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json)
        .then(() => {
            getItems(false, true);
            addNameTextbox.value = '';
        })
        .catch(error => console.error('Unable to add item.', error));
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getItems(false, false))
        .then(() => removeItemFromDOM(id))
        .catch(error => console.error('Unable to delete item.', error))
}

function displayEditForm(id) {
    const item = todos.find(item => item.id === id);

    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-isComplete').checked = item.isComplete;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const itemId = document.getElementById('edit-id').value;
    const item = {
        id: parseInt(itemId, 10),
        isComplete: document.getElementById('edit-isComplete').checked,
        name: document.getElementById('edit-name').value.trim()
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(() => getItems(false, false))
        .catch(error => console.error('Unable to update item.', error));

    closeInput();

    return false;
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(itemCount) {
    const name = (itemCount === 1) ? 'to-do' : 'to-dos';

    document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function _displayItems(data, isInitial, loadInDOM) {
    console.log(data);
    const tBody = document.getElementById('todos');

    _displayCount(data.length);

    if (loadInDOM) {
        if (isInitial) {
            data.forEach(item => {
                createItemInDOM(tBody, item);
            });
        } else {
            createItemInDOM(tBody, data[data.length - 1])
        }
    }
    
    todos = data;
}

function removeItemFromDOM(id) {
    const todo = document.getElementById(`todo-${id}`);

    todo.remove();
}

function createItemInDOM(tBody, item) {
    let isCompleteCheckbox = document.createElement('input');
    isCompleteCheckbox.type = 'checkbox';
    isCompleteCheckbox.disabled = true;
    isCompleteCheckbox.checked = item.isComplete;

    let div1 = document.createElement('div');
    div1.className = 'row px-3 align-items-center todo-item rounded';
    div1.id = `todo-${item.id}`
    tBody.appendChild(div1);

    let isCompleteDiv = document.createElement('div');
    isCompleteDiv.className = 'col-auto m-1 p-0 d-flex align-items-center';
    div1.appendChild(isCompleteDiv);

    let isCompleteH2 = document.createElement('div');
    isCompleteH2.className = 'm-0 p-0';
    isCompleteDiv.appendChild(isCompleteH2);

    let isCompleteIcon1 = document.createElement('div');
    isCompleteIcon1.className = 'fa fa-square-o text-primary btn m-0 p-0 d-none';
    isCompleteIcon1.setAttribute('data-toggle', 'tooltip');
    isCompleteIcon1.setAttribute('data-placement', 'bottom');
    isCompleteIcon1.title = 'Mark as complete';
    isCompleteH2.appendChild(isCompleteIcon1);

    let isCompleteIcon2 = document.createElement('div');
    isCompleteIcon2.className = 'fa fa-check-square-o text-primary btn m-0 p-0';
    isCompleteIcon2.setAttribute('data-toggle', 'tooltip');
    isCompleteIcon2.setAttribute('data-placement', 'bottom');
    isCompleteIcon2.title = 'Mark as todo';
    isCompleteH2.appendChild(isCompleteIcon2);

    let div2 = document.createElement('div');
    div2.className = 'col px-1 m-1 d-flex align-items-center';
    div1.appendChild(div2);

    let input = document.createElement('input');
    input.type = 'text';
    input.value = `${item.name}`;
    input.className = 'form-control form-control-lg border-0 edit-todo-input bg-transparent rounded px-3';
    div2.appendChild(input);

    let div3 = document.createElement('div');
    div3.className = 'col-auto m-1 p-0 px-3 d-none';
    div1.appendChild(div3);

    let div4 = document.createElement('div');
    div4.className = 'col-auto m-1 p-0 todo-actions';
    div1.appendChild(div4);

    let div5 = document.createElement('div');
    div5.className = 'row d-flex align-items-center justify-content-end';
    div4.appendChild(div5);

    let h5a = document.createElement('h5');
    h5a.className = 'm-0 p-0 px-2';
    div5.appendChild(h5a);

    let editButton = document.createElement('i');
    editButton.className = 'fa fa-pencil text-info btn m-0 p-0';
    editButton.setAttribute('data-toggle', 'tooltip');
    editButton.setAttribute('data-placement', 'bottom');
    editButton.setAttribute('onclick', `displayEditForm(${item.id})`);
    editButton.title = 'Edit todo';
    h5a.appendChild(editButton);

    let h5b = document.createElement('h5');
    h5b.className = 'm-0 p-0 px-2';
    div5.appendChild(h5b);

    let deleteButton = document.createElement('i');
    deleteButton.className = 'fa fa-pencil text-danger btn m-0 p-0';
    deleteButton.setAttribute('data-toggle', 'tooltip');
    deleteButton.setAttribute('data-placement', 'bottom');
    deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);
    deleteButton.title = 'Delete todo';
    h5b.appendChild(deleteButton);

    let div6 = document.createElement('div');
    div6.className = 'row todo-created-info';
    div4.appendChild(div6);

    let div7 = document.createElement('div');
    div7.className = 'col-auto d-flex align-items-center pr-2';
    div6.appendChild(div7);

    let ic = document.createElement('i');
    ic.className = 'fa fa-info-circle my-2 px-2 text-black-50 btn';
    ic.setAttribute('data-toggle', 'tooltip');
    ic.setAttribute('data-placement', 'bottom');
    ic.setAttribute('data-original-title', 'Created date');
    ic.title = '';
    div7.appendChild(ic);

    let label = document.createElement('label');
    label.className = 'date-label my-2 text-black-50';
    label.innerHTML = '1/29/2021';
    div7.appendChild(label);
}