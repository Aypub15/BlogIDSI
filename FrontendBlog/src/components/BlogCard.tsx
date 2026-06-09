interface BlogCardProps {
    title: string;
    description: string;
    category: string;
    image: string;
    author: string;
    date: string;
}

export default function BlogCard({ title, description, category, image, author, date }: BlogCardProps) {
    return (
        <article className="blog-card">
            <div className="card-image">
                <img src={image} alt={title} />
                <span className="card-category">{category}</span>
            </div>
            <div className="card-content">
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="card-footer">
                    <div className="author-info">
                        <span className="author-name">{author}</span>
                        <span className="post-date">{date}</span>
                    </div>
                    <button className="read-more">Lire →</button>
                </div>
            </div>
        </article>
    );
}