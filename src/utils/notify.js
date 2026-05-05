import Swal from 'sweetalert2';

const swalBase = {
  confirmButtonColor: '#0f2a47',
  cancelButtonColor: '#64748b',
};

/**
 * Diálogo de confirmación (reemplazo de window.confirm).
 */
export async function confirmAction({
  title,
  text = '',
  icon = 'question',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
}) {
  const { isConfirmed } = await Swal.fire({
    ...swalBase,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });
  return isConfirmed;
}

export function notifySuccess(title, text = '') {
  return Swal.fire({
    ...swalBase,
    icon: 'success',
    title,
    text: text || undefined,
    timer: 2200,
    showConfirmButton: false,
  });
}

export function notifyError(title, text = '') {
  return Swal.fire({
    ...swalBase,
    icon: 'error',
    title,
    text: text || title,
  });
}
