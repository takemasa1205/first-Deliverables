window.onload = function() {
    Vue.createApp({
        data() {
            return {
                memos: [],
                categories: [],
                searchWord: "",
                showModal: false,
                showDeleteModal: false,
                showCategoryModal: false,
                showCategoryEditModal: false,
                selectedMemo: null,
                category: "",
                title: "",
                image: "",
                memoContent: "",
                date: "",
                newCategory: "",
                selectedMemos: [],
                isNewCategory: false,
                categoriesToDelete: []
            };
        },
        methods: {
            openModal() {
                this.selectedMemo = null;
                this.title = "";
                this.category = "";
                this.image = "";
                this.memoContent = "";
                this.date = new Date().toISOString().split('T')[0];
                this.showModal = true;
            },
            closeModal() {
                this.showModal = false;
            },
            clearForm() {
                this.title = "";
                this.category = "";
                this.image = "";
                this.memoContent = "";
            },
            selectMemo(memo) {
                this.selectedMemo = memo;
                this.title = memo.title;
                this.category = memo.category;
                this.image = memo.image;
                this.memoContent = memo.memo;
                this.date = memo.date;
                this.showModal = true;
            },
            addMemo() {
                const newMemo = {
                    id: Date.now(),
                    title: this.title,
                    category: this.category,
                    image: this.image || null,  // 画像がない場合はnull
                    memo: this.memoContent,
                    date: this.date
                };
                fetch('http://localhost:3000/memos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newMemo)
                })
                .then(() => {
                    this.memos.push(newMemo);
                    this.closeModal();
                });
            },
            updateMemo() {
                const updatedMemo = {
                    ...this.selectedMemo,
                    title: this.title,
                    category: this.category,
                    image: this.image,
                    memo: this.memoContent,
                    date: this.date
                };
                fetch(`http://localhost:3000/memos/${this.selectedMemo.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedMemo)
                })
                .then(() => {
                    const index = this.memos.findIndex(memo => memo.id === this.selectedMemo.id);
                    this.memos.splice(index, 1, updatedMemo);
                    this.closeModal();
                });
            },
            deleteMemo() {
                fetch(`http://localhost:3000/memos/${this.selectedMemo.id}`, {
                    method: 'DELETE'
                })
                .then(() => {
                    this.memos = this.memos.filter(memo => memo.id !== this.selectedMemo.id);
                    this.closeModal();
                });
            },
            openDeleteModal() {
                this.showDeleteModal = true;
            },
            closeDeleteModal() {
                this.showDeleteModal = false;
            },
            deleteSelectedMemos() {
                Promise.all(this.selectedMemos.map(id =>
                    fetch(`http://localhost:3000/memos/${id}`, {
                        method: 'DELETE'
                    })
                ))
                .then(() => {
                    this.memos = this.memos.filter(memo => !this.selectedMemos.includes(memo.id));
                    this.selectedMemos = [];
                    this.closeDeleteModal();
                });
            },
            searchMemos() {
                fetch('http://localhost:3000/memos')
                .then(response => response.json())
                .then(data => {
                    this.memos = data.filter(memo =>
                        memo.title.includes(this.searchWord) ||
                        memo.memo.includes(this.searchWord)
                    );
                });
            },
            onCategoryChange(event) {
                if (event.target.value === 'new') {
                    this.isNewCategory = true;
                } else {
                    this.isNewCategory = false;
                }
            },
            openCategoryModal() {
                this.showCategoryModal = true;
                this.newCategory = "";
            },
            closeCategoryModal() {
                this.showCategoryModal = false;
            },
            addNewCategory() {
                if (this.newCategory && !this.categories.includes(this.newCategory)) {
                    this.categories.push(this.newCategory);
                    this.updateCategories();
                    this.newCategory = "";
                }
            },
            updateCategories() {
                fetch('http://localhost:3000/categories', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.categories)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Updated categories:', data); // 更新されたデータをログに表示
                    this.updateSidebarCategories();
                })
                .catch(error => console.error('Error updating categories:', error)); // エラーをログに表示
            }
            ,
            handleFileUpload(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.image = reader.result;
                    };
                    reader.readAsDataURL(file);
                }
            },
            filterByCategory(category) {
                fetch('http://localhost:3000/memos')
                .then(response => response.json())
                .then(data => {
                    this.memos = category ? data.filter(memo => memo.category === category) : data;
                });
            },
            filterByImage() {
                fetch('http://localhost:3000/memos')
                .then(response => response.json())
                .then(data => {
                    this.memos = data.filter(memo => memo.image);
                });
            },
            openCategoryEditModal() {
                this.showCategoryEditModal = true;
                this.categoriesToDelete = [];
            },
            closeCategoryEditModal() {
                this.showCategoryEditModal = false;
                this.newCategory = "";
                this.categoriesToDelete = [];
            },
            addCategory() {
                if (this.newCategory && !this.categories.includes(this.newCategory)) {
                    this.categories.push(this.newCategory);
                    this.updateCategories();
                    this.newCategory = "";
                }
            },
            deleteCategories() {
                this.categories = this.categories.filter(category => !this.categoriesToDelete.includes(category));
                this.updateCategories();
                this.closeCategoryEditModal();
            },
            updateSidebarCategories() {
                this.categories = [...this.categories]; // リアクティブな更新
            }
        },
        mounted() {
            fetch('http://localhost:3000/memos')
            .then(response => response.json())
            .then(data => {
                this.memos = data;
            });

            fetch('http://localhost:3000/categories')
            .then(response => response.json())
            .then(data => {
                this.categories = data;
            });
        }
    }).mount("#app");
}
