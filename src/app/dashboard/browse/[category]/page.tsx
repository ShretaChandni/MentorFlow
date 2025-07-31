
import CategoryClientPage from './category-client-page';

export default function CategoryMentorsPage({ params }: { params: { category: string } }) {
    // The client component will handle decoding.
    return <CategoryClientPage params={params} />;
}
