import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';

export default function WorkList() {
  return (
    <div className={s.container}>
      <WorkHeader/>
    </div>
  );
}