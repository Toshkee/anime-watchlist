function openModal(id, status, notes) {
  const modal = document.getElementById('updateModal');
  modal.style.display = 'block';
  document.getElementById('modalStatus').value = status;
  document.getElementById('modalNotes').value = notes;
  document.getElementById('updateForm').action = `/update/${id}`;
}

function closeModal() {
  document.getElementById('updateModal').style.display = 'none';
}

window.onclick = function (event) {
  const modal = document.getElementById('updateModal');
  if (event.target == modal) modal.style.display = 'none';
};