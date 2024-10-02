import styles from './Card.module.css';

export interface CardProps {
  glow?: boolean;
  children?: React.ReactNode;
}
export const Card = ({ glow, children }: CardProps) => {
  return (
    <div className={[
      styles.card,
      glow ? styles.glow : '',
    ].join(' ')}>
      {children}
    </div>
  );
};
