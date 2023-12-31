import '../../css/modales/Modal.css'

const Modal = ({children, isOpen, closeModal}) => {
  return (
    <article className={`modal ${isOpen && "is-open"}`}>
        <div className="modal-container">
        <button className="modal-close btn btn-outline-danger" onClick={closeModal}>X</button>
        {children}
        </div>
    </article>
  )
}

export default Modal