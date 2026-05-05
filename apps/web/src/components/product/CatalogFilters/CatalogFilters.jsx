import { useMemo } from 'react';
import styles from './CatalogFilters.module.css';

export default function CatalogFilters({
  sizes,
  motor,
  onSizesChange,
  onMotorChange,
  lightTech,
  onLightTechChange,
  controls,
  onControlsChange,
}) {
  const sizeOptions = useMemo(
    () => [
      { id: '16', label: '16" Compact' },
      { id: '42', label: '42" Medium' },
      { id: '52', label: '52" Standard' },
      { id: '56', label: '56" Large' },
    ],
    [],
  );

  const toggleSize = (id) => {
    if (sizes.includes(id)) onSizesChange(sizes.filter((s) => s !== id));
    else onSizesChange([...sizes, id]);
  };

  const toggleControl = (id) => {
    if (controls.includes(id)) onControlsChange(controls.filter((s) => s !== id));
    else onControlsChange([...controls, id]);
  };

  return (
    <aside className={styles.aside}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Size (Diameter)</h3>
        <ul className={styles.list}>
          {sizeOptions.map((o) => (
            <li key={o.id}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={sizes.includes(o.id)}
                  onChange={() => toggleSize(o.id)}
                />
                <span>{o.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Motor Type</h3>
        <div className={styles.segment}>
          <button
            type="button"
            className={`${styles.segBtn} ${motor === 'DC' ? styles.segActive : ''}`}
            onClick={() => onMotorChange('DC')}
          >
            DC Motor
          </button>
          <button
            type="button"
            className={`${styles.segBtn} ${motor === 'AC' ? styles.segActive : ''}`}
            onClick={() => onMotorChange('AC')}
          >
            AC Motor
          </button>
        </div>
      </div>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Light Technology</h3>
        <ul className={styles.list}>
          {['LED Integrated', 'CCT Selectable', 'No Light'].map((label) => (
            <li key={label}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="light"
                  checked={lightTech === label}
                  onChange={() => onLightTechChange(label)}
                />
                <span>{label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Control Type</h3>
        <ul className={styles.list}>
          {[
            { id: 'remote', label: 'Remote Control' },
            { id: 'wifi', label: 'Smart App / Wi-Fi' },
            { id: 'wall', label: 'Wall Control' },
          ].map((o) => (
            <li key={o.id}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={controls.includes(o.id)}
                  onChange={() => toggleControl(o.id)}
                />
                <span>{o.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.hint}>Filtros visuales; el catálogo filtra por categoría y búsqueda.</p>
    </aside>
  );
}
