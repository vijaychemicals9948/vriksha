import styles from './Cover.module.css';

const Cover = () => {
    return (
        <div className={styles.cover}>
            <img
                src="/products/24k-gold-coated-art/brass-on-gold-metalart-banner.jpg"
                alt="Premium Product Title"
                className={styles.image}
            />

            <div className={styles.content}>
                <h1 className={styles.title}>24K Gold Coated Art</h1>

                <p className={styles.description}>
                    
                    This is where your product description will go.
                </p>

                {/* Future buttons / price / rating yahan add kar sakte hain */}
              
            </div>
        </div>
    );
};

export default Cover;
