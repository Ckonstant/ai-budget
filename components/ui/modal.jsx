import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";

export function Modal({ isOpen, onClose, children }) {
  return (
    <Dialog isOpen={isOpen} onDismiss={onClose}>
      <DialogOverlay />
      <DialogContent>
        {children}
        <button className="close-button" onClick={onClose}>
          <span aria-hidden>×</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}

export function ModalHeader({ children }) {
  return <div className="modal-header">{children}</div>;
}

export function ModalBody({ children }) {
  return <div className="modal-body">{children}</div>;
}

export function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}