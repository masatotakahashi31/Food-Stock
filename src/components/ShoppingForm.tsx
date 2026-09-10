type Category = {
    id: number
    categoryName:string
}

type Props = {
    categories: Category[]
    action: (formData: FormData) => void
    // 編集の時だけ渡される「最初のデータ」のルールを追加（?をつけると「無くてもOK」という意味
    initialData?: {
        categoryId: number
        itemName: string
        quantity: number
    }
}

export default function ShoppingForm({categories, action, initialData}: Props) {
    return(
        <form action={action}>
            <div>
                    <label>カテゴリ</label>
                    <select name="categoryId" defaultValue={initialData?.categoryId} required >
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
                    <input type="text" name="itemName" defaultValue={initialData?.itemName} required />
                </div>
                
                <div>
                    <label>数量:</label>
                    <input type="number" name="quantity" defaultValue={initialData?.quantity || 1} min='1' required />
                </div>

                    <button type="submit">{initialData ? "更新する" : "追加する"}</button>

            </form>
    )
}