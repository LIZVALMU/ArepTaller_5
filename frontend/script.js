const API_BASE = 'http://localhost:8080/api/properties';
let currentPage = 0;
let totalPages = 0;

const form = document.getElementById('property-form');
const idField = document.getElementById('property-id');
const addressField = document.getElementById('address');
const priceField = document.getElementById('price');
const sizeField = document.getElementById('size');
const descField = document.getElementById('description');
const messageDiv = document.getElementById('message');
const cancelEditBtn = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

const filterAddress = document.getElementById('filter-address');
const filterMinPrice = document.getElementById('filter-minPrice');
const filterMaxPrice = document.getElementById('filter-maxPrice');
const filterMinSize = document.getElementById('filter-minSize');
const filterMaxSize = document.getElementById('filter-maxSize');

document.getElementById('apply-filters').addEventListener('click', () => loadProperties(0));
document.getElementById('clear-filters').addEventListener('click', () => {
  filterAddress.value = filterMinPrice.value = filterMaxPrice.value = filterMinSize.value = filterMaxSize.value = '';
  loadProperties(0);
});

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 0) loadProperties(currentPage - 1);
});
document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage < totalPages - 1) loadProperties(currentPage + 1);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    address: addressField.value.trim(),
    price: parseFloat(priceField.value),
    size: parseFloat(sizeField.value),
    description: descField.value.trim()
  };
  if (!payload.address || !payload.price || !payload.size) {
    showMessage('Campos obligatorios faltantes', true);
    return;
  }
  try {
    const id = idField.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/${id}` : API_BASE;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error HTTP ' + res.status);
    showMessage(id ? 'Propiedad actualizada' : 'Propiedad creada');
    form.reset();
    idField.value = '';
    toggleEditMode(false);
    loadProperties(currentPage);
  } catch (err) {
    showMessage(err.message, true);
  }
});

function toggleEditMode(editing) {
  if (editing) {
    formTitle.textContent = 'Editar Propiedad';
    submitBtn.textContent = 'Actualizar';
    cancelEditBtn.style.display = 'inline-block';
  } else {
    formTitle.textContent = 'Crear Propiedad';
    submitBtn.textContent = 'Guardar';
    cancelEditBtn.style.display = 'none';
  }
}

cancelEditBtn.addEventListener('click', () => {
  form.reset();
  idField.value = '';
  toggleEditMode(false);
});

async function loadProperties(page = 0) {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', 5);
  if (filterAddress.value) params.append('address', filterAddress.value);
  if (filterMinPrice.value) params.append('minPrice', filterMinPrice.value);
  if (filterMaxPrice.value) params.append('maxPrice', filterMaxPrice.value);
  if (filterMinSize.value) params.append('minSize', filterMinSize.value);
  if (filterMaxSize.value) params.append('maxSize', filterMaxSize.value);
  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error('Error cargando propiedades');
    const data = await res.json();
    currentPage = data.number;
    totalPages = data.totalPages;
    document.getElementById('page-info').textContent = `Página ${currentPage + 1} de ${totalPages}`;
    renderTable(data.content);
  } catch (err) {
    showMessage(err.message, true);
  }
}

function renderTable(list) {
  const tbody = document.querySelector('#properties-table tbody');
  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Sin resultados</td></tr>';
    return;
  }
  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${escapeHtml(p.address)}</td>
      <td>${p.price}</td>
      <td>${p.size}</td>
      <td>${p.description ? escapeHtml(p.description) : ''}</td>
      <td>
        <button data-id="${p.id}" class="edit-btn">Editar</button>
        <button data-id="${p.id}" class="delete-btn">Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => startEdit(btn.dataset.id)));
  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteProperty(btn.dataset.id)));
}

async function startEdit(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('No se pudo obtener la propiedad');
    const p = await res.json();
    idField.value = p.id;
    addressField.value = p.address;
    priceField.value = p.price;
    sizeField.value = p.size;
    descField.value = p.description || '';
    toggleEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showMessage(err.message, true);
  }
}

async function deleteProperty(id) {
  if (!confirm('¿Eliminar propiedad #' + id + '?')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error eliminando');
    showMessage('Propiedad eliminada');
    loadProperties(currentPage);
  } catch (err) {
    showMessage(err.message, true);
  }
}

function showMessage(msg, error = false) {
  messageDiv.textContent = msg;
  messageDiv.className = error ? 'error' : 'success';
  setTimeout(() => { messageDiv.textContent = ''; messageDiv.className = ''; }, 4000);
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

loadProperties();
