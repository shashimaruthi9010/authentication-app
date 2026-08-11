import Icon from './ui/Icon';

/**
 * Inline field-level validation error message.
 */
export default function FieldError({ message }) {
  if (!message) return null;
  return (
    <div className="field__error" role="alert">
      <Icon name="alert" size={13} />
      <span>{message}</span>
    </div>
  );
}
