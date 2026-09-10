type Category = {
    id: number
    categoryName:string
}

type Props = {
    categories: Category[]
    action: (formData: FormData) => void
}

export default function ShoppingForm({categories, action}: Props) {
    return(
        <form action={action}>
            <div>
                    <label>カテゴリ</label>
                    <select name="categoryId" required>
                        <option value="">選択してください</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>品名:</label>
                    <input type="text" name="itemName" required />
                </div>
                
                <div>
                    <label>数量:</label>
                    <input type="number" name="quantity" defaultValue={1} min='1' required />
                </div>

                    <button type="submit">追加する</button>

            </form>
    )
}