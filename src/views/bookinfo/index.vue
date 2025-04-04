<template>
  <div class="app-container">
    <!-- 顶部功能区 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-container">
        <el-input 
          v-model="queryParam.bookname" 
          placeholder="书名" 
          class="filter-item"
          clearable
          @keyup.enter.native="handleFilter">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        
        <el-input 
          v-model="queryParam.bookauthor" 
          placeholder="作者" 
          class="filter-item"
          clearable
          @keyup.enter.native="handleFilter">
          <i slot="prefix" class="el-input__icon el-icon-user"></i>
        </el-input>
        
        <el-select 
          v-model="queryParam.booktypeid" 
          filterable 
          placeholder="类型" 
          clearable 
          class="filter-item">
          <i slot="prefix" class="el-input__icon el-icon-collection-tag"></i>
          <el-option 
            v-for="item in typeData" 
            :key="item.booktypeid" 
            :label="item.booktypename" 
            :value="item.booktypeid" />
        </el-select>
        
        <el-button-group class="btn-group">
          <el-button 
            v-waves 
            type="success" 
            icon="el-icon-search" 
            @click="handleFilter">
            搜索
          </el-button>
          <el-button 
            v-waves 
            type="info" 
            icon="el-icon-refresh" 
            @click="handleShowAll">
            重置
          </el-button>
          <el-button 
            v-permission="['admin']" 
            type="primary" 
            icon="el-icon-plus" 
            @click="handleCreate">
            添加
          </el-button>
          <el-button 
            v-permission="['admin']" 
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
        style="width: 100%">
        
        <el-table-column type="selection" width="45" align="center"></el-table-column>
        <el-table-column prop="bookid" label="序号" width="80" align="center"></el-table-column>
        
        <el-table-column v-if="roleIsAdmin === false" label="封面" width="120" align="center">
          <template slot-scope="scope">
            <el-image 
              :src="scope.row.bookimg" 
              fit="contain" 
              style="width: 80px; height: 100px"
              :preview-src-list="[scope.row.bookimg]">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="bookname" label="书名" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="bookauthor" label="作者" width="120" align="center"></el-table-column>
        <el-table-column prop="bookprice" label="价格" width="100" align="center">
          <template slot-scope="scope">
            <span style="color: #e6a23c">¥{{scope.row.bookprice}}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="booktypename" label="类型" width="120" align="center"></el-table-column>
        <el-table-column prop="bookdesc" label="描述" min-width="200" show-overflow-tooltip></el-table-column>
        
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isborrowed === 1 ? 'danger' : 'success'" size="small">
              {{scope.row.isborrowed === 1 ? '已借出' : '可借阅'}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" :width="roleIsAdmin ? 180 : 120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button 
              v-permission="['admin']" 
              @click="handleUpdate(scope.row)" 
              type="primary" 
              icon="el-icon-edit" 
              size="mini" 
              circle></el-button>
              
            <el-button 
              v-permission="['admin']" 
              @click="handleDelete(scope.row,scope.$index)" 
              type="danger" 
              icon="el-icon-delete" 
              size="mini" 
              circle></el-button>
              
            <el-button 
              @click="handleBorrow(scope.row)" 
              type="success" 
              icon="el-icon-reading" 
              size="mini" 
              circle
              :disabled="scope.row.isborrowed === 1"></el-button>
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
      width="50%"
      :close-on-click-modal="false">
      
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item label="图书名称" prop="bookname">
              <el-input v-model="form.bookname" placeholder="请输入图书名称"></el-input>
            </el-form-item>
            
            <el-form-item label="作者" prop="bookauthor">
              <el-input v-model="form.bookauthor" placeholder="请输入作者"></el-input>
            </el-form-item>
            
            <el-form-item label="价格" prop="bookprice">
              <el-input v-model="form.bookprice" placeholder="请输入价格">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="图书类型" prop="booktypeid">
              <el-select v-model="form.booktypeid" placeholder="请选择类型" style="width:100%">
                <el-option
                  v-for="item in typeData"
                  :key="item.booktypeid"
                  :label="item.booktypename"
                  :value="item.booktypeid">
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="书籍描述" prop="bookdesc">
              <el-input type="textarea" v-model="form.bookdesc" :rows="3" placeholder="请输入书籍描述"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        
        <el-col :span="8">
          <div class="upload-wrapper">
            <h4 class="upload-title">图书封面</h4>
            <el-upload
              class="avatar-uploader"
              action="http://localhost:8092/BookManager/update/updateImg"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
              
              <img v-if="form.bookimg" :src="form.bookimg" class="avatar">
              <div v-else class="upload-default">
                <i class="el-icon-plus avatar-uploader-icon"></i>
                <p>点击上传封面</p>
              </div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 借阅对话框 -->
    <el-dialog 
      title="选择用户" 
      :visible.sync="dialogFormVisible2" 
      width="400px"
      :close-on-click-modal="false">
      
      <el-form :model="form2" label-width="80px">
        <el-form-item label="用户名">
          <el-select 
            v-model="form2.userid" 
            placeholder="请选择用户" 
            style="width:100%"
            filterable>
            <el-option
              v-for="item in userData"
              :key="item.userid"
              :label="item.username"
              :value="item.userid">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="submitForm2" :loading="formLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import permission from '@/directive/permission/index.js'
import waves from '@/directive/waves'
import {
  getCount,
  queryBookInfosByPage,
  addBookInfo,
  deleteBookInfo,
  deleteBookInfos,
  updateBookInfo
} from '@/api/bookinfo'
import { queryBookTypes } from '@/api/booktype'
import { borrowBook } from '@/api/borrow'
import { queryUsers } from '@/api/user'

export default {
  name: 'Bookinfo',
  directives: { waves, permission },
  data() {
    return {
      loading: false,
      formLoading: false,
      tableData: [],
      recordTotal: 0,
      typeData: [],
      userData: [],
      queryParam: {
        page: 1,
        limit: 10,
        bookname: null,
        bookauthor: null,
        booktypeid: null
      },
      dialogFormVisible: false,
      dialogFormVisible2: false,
      formType: 0,
      form: {
        bookid: '',
        bookname: '',
        bookauthor: '',
        bookprice: 0,
        booktypeid: 1,
        bookdesc: '',
        isborrowed: 0,
        bookimg: ''
      },
      form2: {
        userid: null,
        bookid: null
      },
      rules: {
        bookname: [
          { required: true, message: '请输入图书名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在1到50个字符', trigger: 'blur' }
        ],
        bookauthor: [
          { required: true, message: '请输入作者', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在1到30个字符', trigger: 'blur' }
        ],
        bookprice: [
          { required: true, message: '请输入价格', trigger: 'blur' },
          { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的价格格式', trigger: 'blur' }
        ],
        booktypeid: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        bookdesc: [
          { required: true, message: '请输入描述', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在1到200个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['id','name','roles']),
    formTitle() {
      return this.formType === 0 ? '添加图书' : '编辑图书'
    },
    roleIsAdmin() {
      return this.roles[0] === 'admin'
    }
  },
  created() {
    this.fetchData()
    this.fetchTypes()
  },
  mounted() {
    if (!this.roleIsAdmin) {
      this.queryParam.limit = 5
      this.handleSizeChange(this.queryParam.limit)
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      queryBookInfosByPage(this.queryParam).then(res => {
        this.tableData = res.data
        this.recordTotal = res.count
      }).finally(() => {
        this.loading = false
      })
    },
    fetchTypes() {
      queryBookTypes().then(res => {
        this.typeData = res
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
        bookname: null,
        bookauthor: null,
        booktypeid: null
      }
      this.fetchData()
    },
    handleAvatarSuccess(res) {
      if(res.code === 0) {
        this.$message.success('上传成功')
        this.form.bookimg = res.data
      } else {
        this.$message.error('上传失败')
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handleCreate() {
      this.fetchTypes()
      this.formType = 0
      this.form = {
        bookid: null,
        bookname: '',
        bookauthor: '',
        bookprice: 0,
        booktypeid: this.typeData.length > 0 ? this.typeData[0].booktypeid : null,
        bookdesc: '',
        isborrowed: 0,
        bookimg: ''
      }
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.fetchTypes()
      this.formType = 1
      this.form = {
        bookid: row.bookid,
        bookname: row.bookname,
        bookauthor: row.bookauthor,
        bookprice: row.bookprice,
        booktypeid: row.booktypeid,
        bookdesc: row.bookdesc,
        isborrowed: row.isborrowed,
        bookimg: row.bookimg
      }
      this.dialogFormVisible = true
    },
    handleBorrow(row) {
      if (this.roleIsAdmin) {
        this.form2.bookid = row.bookid
        queryUsers().then(res => {
          this.userData = res
          this.dialogFormVisible2 = true
        })
      } else {
        this.$confirm('确定要借阅这本书吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.formLoading = true
          borrowBook(this.id, row.bookid).then(res => {
            if(res === 1) {
              this.$message.success('借书成功')
              this.fetchData()
            } else {
              this.$message.error('借书失败')
            }
          }).finally(() => {
            this.formLoading = false
          })
        })
      }
    },
    submitForm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.formLoading = true
          const action = this.formType === 0 ? addBookInfo(this.form) : updateBookInfo(this.form)
          
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
    submitForm2() {
      if (!this.form2.userid) {
        this.$message.warning('请选择用户')
        return
      }
      
      this.formLoading = true
      borrowBook(this.form2.userid, this.form2.bookid).then(res => {
        if(res === 1) {
          this.$message.success('借书成功')
          this.fetchData()
          this.dialogFormVisible2 = false
        } else {
          this.$message.error('借书失败')
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定要删除这本书吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBookInfo(row).then(res => {
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
      
      this.$confirm(`确定要删除选中的${items.length}本书吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBookInfos(items).then(res => {
          if(res > 0) {
            this.$message.success(`成功删除${res}本书`)
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
  max-width: 200px;
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

.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.upload-title {
  margin-bottom: 15px;
  color: #606266;
}

.avatar-uploader {
  width: 150px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-default {
  text-align: center;
  color: #8c939d;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.el-table >>> .el-table__body tr:hover>td {
  background-color: #f0f9eb !important;
}

.el-tag {
  font-weight: 500;
}
</style>