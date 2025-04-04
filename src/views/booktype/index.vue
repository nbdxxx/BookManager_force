<template>
  <div class="app-container">
    <!-- 顶部功能区 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-container">
        <el-input 
          v-model="queryParam.booktypename" 
          placeholder="类型名" 
          clearable
          class="filter-item"
          @keyup.enter.native="handleFilter">
          <i slot="prefix" class="el-input__icon el-icon-collection-tag"></i>
        </el-input>
        
        <el-button-group class="btn-group">
          <el-button 
            type="success" 
            icon="el-icon-search" 
            @click="handleFilter">
            搜索
          </el-button>
          <el-button 
            type="info" 
            icon="el-icon-refresh" 
            @click="handleShowAll">
            重置
          </el-button>
          <el-button 
            type="primary" 
            icon="el-icon-plus" 
            @click="handleCreate">
            添加类型
          </el-button>
          <el-button 
            type="danger" 
            icon="el-icon-delete" 
            @click="handleDeleteSome">
            批量删除
          </el-button>
        </el-button-group>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        ref="multipleTable"
        :data="tableData"
        border
        stripe
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        empty-text="暂无数据"
        style="width: 100%"
        :header-cell-style="{background: '#f5f7fa', color: '#606266'}">
        
        <el-table-column type="selection" width="45" align="center"></el-table-column>
        <el-table-column prop="booktypeid" label="序号" width="80" align="center"></el-table-column>
        
        <el-table-column 
          prop="booktypename" 
          label="类型名称" 
          min-width="180"
          show-overflow-tooltip>
        </el-table-column>
        
        <el-table-column 
          prop="booktypedesc" 
          label="类型描述" 
          min-width="300"
          show-overflow-tooltip>
        </el-table-column>
        
        <el-table-column 
          label="操作" 
          width="150" 
          align="center" 
          fixed="right">
          <template slot-scope="scope">
            <el-button 
              @click="handleUpdate(scope.row)" 
              type="primary" 
              icon="el-icon-edit" 
              size="mini" 
              circle></el-button>
              
            <el-button 
              @click="handleDelete(scope.row,scope.$index)" 
              type="danger" 
              icon="el-icon-delete" 
              size="mini" 
              circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryParam.page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryParam.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="recordTotal"
        class="pagination">
      </el-pagination>
    </el-card>

    <!-- 编辑/添加对话框 -->
    <el-dialog 
      :title="formTitle" 
      :visible.sync="dialogFormVisible" 
      width="500px"
      :close-on-click-modal="false">
      
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="ruleForm" 
        label-width="100px"
        label-position="left">
        
        <el-form-item label="类型名称" prop="booktypename">
          <el-input 
            v-model="form.booktypename" 
            placeholder="请输入类型名称"
            clearable>
          </el-input>
        </el-form-item>
        
        <el-form-item label="类型描述" prop="booktypedesc">
          <el-input 
            type="textarea" 
            v-model="form.booktypedesc" 
            :rows="4"
            placeholder="请输入类型描述"
            clearable>
          </el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import waves from '@/directive/waves'
import { 
  getCount,
  queryBookTypes,
  queryBookTypesByPage,
  addBookType,
  deleteBookType,
  deleteBookTypes,
  updateBookType 
} from '@/api/booktype'

export default {
  name: 'BookType',
  directives: { waves },
  data() {
    return {
      loading: false,
      formLoading: false,
      tableData: [],
      recordTotal: 0,
      queryParam: {
        page: 1,
        limit: 10,
        booktypename: null
      },
      dialogFormVisible: false,
      formType: 0,
      form: {
        booktypeid: null,
        booktypename: '',
        booktypedesc: ''
      },
      rules: {
        booktypename: [
          { required: true, message: '请输入类型名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ],
        booktypedesc: [
          { required: true, message: '请输入类型描述', trigger: 'blur' },
          { min: 5, max: 100, message: '长度在5到100个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['id','name','roles']),
    formTitle() {
      return this.formType === 0 ? '添加图书类型' : '编辑图书类型'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      queryBookTypesByPage(this.queryParam).then(res => {
        this.tableData = res.data
        this.recordTotal = res.count
      }).finally(() => {
        this.loading = false
      })
    },
    handleSizeChange(curSize) {
      this.queryParam.limit = curSize
      this.fetchData()
    },
    handleCurrentChange(curPage) {
      this.queryParam.page = curPage
      this.fetchData()
    },
    handleFilter() {
      this.queryParam.page = 1
      this.fetchData()
    },
    handleShowAll() {
      this.queryParam = {
        page: 1,
        limit: this.queryParam.limit,
        booktypename: null
      }
      this.fetchData()
    },
    handleCreate() {
      this.formType = 0
      this.form = {
        booktypeid: null,
        booktypename: '',
        booktypedesc: ''
      }
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.formType = 1
      this.form = {
        booktypeid: row.booktypeid,
        booktypename: row.booktypename,
        booktypedesc: row.booktypedesc
      }
      this.dialogFormVisible = true
    },
    submitForm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.formLoading = true
          const action = this.formType === 0 
            ? addBookType(this.form) 
            : updateBookType(this.form)
          
          action.then(res => {
            if(res === 1) {
              this.$message.success(this.formType === 0 ? '添加成功' : '更新成功')
              this.fetchData()
              this.dialogFormVisible = false
            } else {
              this.$message.error('操作失败')
            }
          }).finally(() => {
            this.formLoading = false
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定要删除该类型吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBookType(row).then(res => {
          if(res === 1) {
            this.$message.success('删除成功')
            this.tableData.splice(index, 1)
            if(this.tableData.length === 0 && this.queryParam.page > 1) {
              this.queryParam.page -= 1
              this.fetchData()
            }
          } else {
            this.$message.error('删除失败')
          }
        }).finally(() => {
          this.loading = false
        })
      })
    },
    handleDeleteSome() {
      const items = this.$refs.multipleTable.selection
      if (items.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      this.$confirm(`确定要删除选中的${items.length}个类型吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBookTypes(items).then(res => {
          if(res > 0) {
            this.$message.success(`成功删除${res}个类型`)
            if(this.tableData.length === res) {
              this.queryParam.page = Math.max(1, this.queryParam.page - 1)
            }
            this.fetchData()
          } else {
            this.$message.error('删除失败')
          }
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.filter-item {
  flex: 1;
  max-width: 250px;
}

.btn-group {
  margin-left: auto;
}

.table-card {
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: center;
}

.el-table >>> .el-table__body tr:hover>td {
  background-color: #f0f9eb !important;
}

.el-dialog__title {
  color: #136b36;
  font-weight: bold;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.el-button.is-circle {
  margin: 0 5px;
}
</style>