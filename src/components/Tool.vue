<template>
  <div id="tool">
    <el-button @click="startHandler" type="primary" size="mini">{{
      running ? '停止' : '开始'
    }}</el-button>
    <el-button size="mini" @click="showRemoveoptions = true">
      重置
    </el-button>
    <el-button size="mini" @click="showImport = true">
      导入名单
    </el-button>
    <el-button size="mini" @click="showImportphoto = true">
      导入照片
    </el-button>
    <el-dialog
      :append-to-body="true"
      :visible.sync="showSetwat"
      class="setwat-dialog"
      width="400px"
      title="抽奖配置"
    >
      <el-form ref="form" :model="form" label-width="80px" size="mini">
        <el-form-item label="抽取奖项">
          <el-select v-model="form.category" placeholder="请选取本次抽取的奖项">
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in categorys"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label=" " v-if="form.category">
          <span>
            共&nbsp;
            <span class="colorred">{{ config[form.category] }}</span>
            &nbsp;名
          </span>
          <span :style="{ marginLeft: '20px' }">
            剩余&nbsp;
            <span class="colorred">{{ remain }}</span>
            &nbsp;名
          </span>
        </el-form-item>

        <el-form-item label="抽取方式">
          <el-select v-model="form.mode" placeholder="请选取本次抽取方式">
            <el-option label="抽1人" :value="1"></el-option>
            <el-option label="抽5人" :value="5"></el-option>
            <el-option label="一次抽取完" :value="0"></el-option>
            <el-option label="自定义" :value="99"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抽取人数" v-if="form.mode === 99">
          <el-input
            v-model="form.qty"
            type="number"
            :clearable="true"
            :min="1"
            :max="remain ? remain : 100"
            :step="1"
          ></el-input>
        </el-form-item>

        <el-form-item label="全员参与">
          <el-switch v-model="form.allin"></el-switch>
          <span :style="{ fontSize: '12px' }">
            (开启后将在全体成员[无论有无中奖]中抽奖)
          </span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即抽奖</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      :append-to-body="true"
      :visible.sync="showImport"
      class="import-dialog"
      width="400px"
      title="导入名单"
    >
      <el-input
        type="textarea"
        :rows="10"
        placeholder="请输入对应的号码和名单(可直接从excel复制)，格式(号码 名字)，导入的名单将代替号码显示在抽奖中。如：
1 张三
2 李四
3 王五
				"
        v-model="listStr"
      ></el-input>
      <div class="footer">
        <el-button size="mini" type="primary" @click="transformList"
          >确定</el-button
        >
        <el-button size="mini" @click="showImport = false">取消</el-button>
      </div>
    </el-dialog>
    <Importphoto
      :visible.sync="showImportphoto"
      @getPhoto="$emit('getPhoto')"
    ></Importphoto>

    <el-dialog
      :visible.sync="showRemoveoptions"
      width="300px"
      class="c-removeoptions"
      :append-to-body="true"
      title="重置选项"
    >
      <el-form ref="form" :model="removeInfo" label-width="80px" size="mini">
        <el-form-item label="重置选项">
          <el-radio-group v-model="removeInfo.type">
            <el-radio border :label="0">重置全部数据</el-radio>
            <el-radio border :label="1">重置抽奖配置</el-radio>
            <el-radio border :label="2">重置名单</el-radio>
            <el-radio border :label="3">重置照片</el-radio>
            <el-radio border :label="4">重置抽奖结果</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetConfig">确定重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  clearData,
  removeData,
  configField,
  listField,
  resultField,
  conversionCategoryName
} from '@/helper/index';
import Importphoto from './Importphoto';
import { database, DB_STORE_NAME } from '@/helper/db';

export default {
  props: {
    running: Boolean,
    closeRes: Function
  },
  computed: {
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    remain() {
      return (
        this.config[this.form.category] -
        (this.result[this.form.category]
          ? this.result[this.form.category].length
          : 0)
      );
    },
    result() {
      return this.$store.state.result;
    },
    categorys() {
      const options = [];
      for (const key in this.config) {
        if (this.config.hasOwnProperty(key)) {
          const item = this.config[key];
          if (item > 0) {
            let name = conversionCategoryName(key);
            name &&
              options.push({
                label: name,
                value: key
              });
          }
        }
      }
      return options;
    }
  },
  components: { Importphoto },
  data() {
    return {
      showSetwat: false,
      showImport: false,
      showImportphoto: false,
      showRemoveoptions: false,
      removeInfo: { type: 0 },
      form: {
        category: '',
        mode: 1,
        qty: 1,
        allin: false
      },
      listStr: ''
    };
  },
  watch: {
    showRemoveoptions(v) {
      if (!v) {
        this.removeInfo.type = 0;
      }
    }
  },
  methods: {
    resetConfig() {
      const type = this.removeInfo.type;
      this.$confirm('此操作将重置所选数据，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          switch (type) {
            case 0:
              clearData();
              this.$store.commit('setClearStore');
              database.clear(DB_STORE_NAME);
              break;
            case 1:
              removeData(configField);
              this.$store.commit('setClearConfig');
              break;
            case 2:
              removeData(listField);
              this.$store.commit('setClearList');
              break;
            case 3:
              database.clear(DB_STORE_NAME);
              this.$store.commit('setClearPhotos');
              break;
            case 4:
              removeData(resultField);
              this.$store.commit('setClearResult');
              break;
            default:
              break;
          }

          this.closeRes && this.closeRes();

          this.showRemoveoptions = false;
          this.$message({
            type: 'success',
            message: '重置成功!'
          });

          this.$nextTick(() => {
            this.$emit('resetConfig');
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },
    onSubmit() {
      if (!this.form.category) {
        return this.$message.error('请选择本次抽取的奖项');
      }
      if (this.remain <= 0) {
        return this.$message.error('该奖项剩余人数不足');
      }
      if (this.form.mode === 99) {
        if (this.form.qty <= 0) {
          return this.$message.error('必须输入本次抽取人数');
        }
        if (this.form.qty > this.remain) {
          return this.$message.error('本次抽奖人数已超过本奖项的剩余人数');
        }
      }
      if (this.form.mode === 1 || this.form.mode === 5) {
        if (this.form.mode > this.remain) {
          return this.$message.error('本次抽奖人数已超过本奖项的剩余人数');
        }
      }
      this.showSetwat = false;
      this.$emit(
        'toggle',
        Object.assign({}, this.form, { remain: this.remain })
      );
    },
    startHandler() {
      this.$emit('toggle');
      if (!this.running) {
        this.showSetwat = true;
      }
    },
    transformList() {
      const { listStr } = this;
      if (!listStr) {
        this.$message.error('没有数据');
      }
      const list = [];
      const rows = listStr.split('\n');
      if (rows && rows.length > 0) {
        rows.forEach(item => {
          const rowList = item.split(/\t|\s/);
          if (rowList.length >= 2) {
            const key = Number(rowList[0].trim());
            const name = rowList[1].trim();
            key &&
              list.push({
                key,
                name
              });
          }
        });
      }
      this.$store.commit('setList', list);

      this.$message({
        message: '保存成功',
        type: 'success'
      });
      this.showImport = false;
      this.$nextTick(() => {
        this.$emit('resetConfig');
      });
    }
  }
};
</script>
<style lang="scss">
#tool {
  position: fixed;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 10;

  .el-button {
    width: 120px;
    height: 40px;
    font-size: 14px;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &.el-button--primary {
      width: 120px;
      padding: 0;
      margin: 0;
      background: linear-gradient(45deg, #23d5ab, #23a6d5);
      
      &:hover {
        background: linear-gradient(45deg, #23a6d5, #23d5ab);
      }
    }
    
    &:nth-child(2) {
      background: linear-gradient(45deg, #ee7752, #e73c7e);
      
      &:hover {
        background: linear-gradient(45deg, #e73c7e, #ee7752);
      }
    }
    
    &:nth-child(3) {
      background: linear-gradient(45deg, #904e95, #e96443);
      
      &:hover {
        background: linear-gradient(45deg, #e96443, #904e95);
      }
    }
    
    &:nth-child(4) {
      background: linear-gradient(45deg, #614385, #516395);
      
      &:hover {
        background: linear-gradient(45deg, #516395, #614385);
      }
    }

    &:hover {
      transform: translateX(-5px);
      box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateX(-2px);
    }

    &.is-disabled {
      background: rgba(255, 255, 255, 0.2) !important;
      color: rgba(255, 255, 255, 0.6) !important;
      cursor: not-allowed;
      transform: none;
      
      &:hover {
        box-shadow: none;
      }
    }
  }
}
.setwat-dialog {
  .el-dialog {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .el-dialog__header {
      padding: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(45deg, #23d5ab, #23a6d5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .el-dialog__body {
      padding: 25px 20px !important;

      .el-form-item {
        margin-bottom: 20px !important;
        
        &:last-child {
          margin-bottom: 0 !important;
        }

        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .el-select {
          width: 100%;
        }

        .el-select .el-input__inner,
        .el-input__inner {
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          
          &:hover, &:focus {
            border-color: #23a6d5;
            box-shadow: 0 0 0 2px rgba(35, 166, 213, 0.1);
          }
        }

        .el-switch {
          margin-right: 10px;
        }
      }

      .colorred {
        color: #e73c7e;
        font-weight: 600;
        font-size: 16px;
      }
    }

    .el-dialog__footer {
      padding: 10px 20px 20px;
      text-align: center;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
  }

  // 立即抽奖按钮样式
  .el-button--primary {
    width: 180px;
    height: 45px;
    font-size: 16px;
    font-weight: 500;
    color: white;
    border: none;
    border-radius: 25px;
    background: linear-gradient(45deg, #23d5ab, #23a6d5);
    box-shadow: 0 4px 12px rgba(35, 166, 213, 0.2);
    transition: all 0.3s ease;
    margin: 0;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(35, 166, 213, 0.3);
      background: linear-gradient(45deg, #23a6d5, #23d5ab);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}
.import-dialog {
  .el-dialog {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .el-dialog__header {
      padding: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(45deg, #904e95, #e96443);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .el-dialog__body {
      padding: 25px 20px !important;

      .el-textarea__inner {
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 15px;
        transition: all 0.3s ease;
        
        &:hover, &:focus {
          border-color: #e96443;
          box-shadow: 0 0 0 2px rgba(233, 100, 67, 0.1);
        }
      }
    }

    .footer {
      padding: 10px 20px 20px;
      text-align: center;
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      .el-button {
        width: 120px;
        height: 40px;
        font-size: 14px;
        border-radius: 20px;
        
        &--primary {
          background: linear-gradient(45deg, #904e95, #e96443);
          border: none;
          box-shadow: 0 4px 12px rgba(233, 100, 67, 0.2);
          
          &:hover {
            background: linear-gradient(45deg, #e96443, #904e95);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(233, 100, 67, 0.3);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}
.c-removeoptions {
  .el-dialog {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .el-dialog__header {
      padding: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(45deg, #ee7752, #e73c7e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .el-dialog__body {
      padding: 25px 20px !important;

      .el-radio.is-bordered {
        width: 100%;
        margin-left: 0;
        margin-bottom: 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #e73c7e;
          box-shadow: 0 0 0 2px rgba(231, 60, 126, 0.1);
        }
        
        &.is-checked {
          border-color: #e73c7e;
          background: rgba(231, 60, 126, 0.05);
        }
      }

      .el-form-item {
        margin-bottom: 0 !important;
      }
    }

    .el-dialog__footer {
      padding: 10px 20px 20px;
      text-align: center;
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      .el-button {
        width: 120px;
        height: 40px;
        font-size: 14px;
        border-radius: 20px;
        
        &--primary {
          background: linear-gradient(45deg, #ee7752, #e73c7e);
          border: none;
          box-shadow: 0 4px 12px rgba(231, 60, 126, 0.2);
          
          &:hover {
            background: linear-gradient(45deg, #e73c7e, #ee7752);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(231, 60, 126, 0.3);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}
</style>
