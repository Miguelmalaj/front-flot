import '../../css/modales/Modal.css'

const ModalGrande = ({children, isOpen, closeModal}) => {
  return (
    <article className={`modal ${isOpen && "is-open"}`}>
        <div className="modal-container-grande">
            <button className="modal-close btn btn-outline-danger" onClick={closeModal}>X</button>
            {children}
        </div>
    </article>
  )
}

export default ModalGrande