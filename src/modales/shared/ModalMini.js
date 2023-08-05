import '../../css/modales/Modal.css'

const ModalMini = ({children, isOpen, closeModal}) => {
  return (
    <article className={`modal ${isOpen && "is-open"}`}>
        <div className="modal-container-mini">
        <button className="modal-close btn btn-outline-danger" onClick={closeModal}>X</button>
        {children}
        </div>
    </article>
  )
}

export default ModalMini;