<template>
  <b-container class="p-2">
    <b-row class="mb-3">
      <b-col>
        <h2>Datasets</h2>
      </b-col>
    </b-row>
    <b-row style="background-color: white; padding: 10px; border-radius: 10px;">
      <b-col>
        <label for="from-date">From</label>
        <b-form-datepicker size="sm" id="from-date" v-model="filter.fromDate"></b-form-datepicker>
      </b-col>
      <b-col>
        <label for="to-date">To</label>
        <b-form-datepicker size="sm" id="to-date" v-model="filter.toDate"></b-form-datepicker>
      </b-col>
      <b-col class="pt-4">
        <b-button size="sm">Apply</b-button>
      </b-col>
    </b-row>
    <b-row class="pt-4">
      <b-col>
        <b-table striped hover small :items="collections" :busy="collections === null" :fields="fields"
                 selectable select-mode="single" @row-selected="onRowSelected">
          <template #table-busy>
            <div class="text-center my-2">
              <b-spinner class="align-middle"></b-spinner>
              <strong>Loading...</strong>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-pagination :total-rows="100" size="sm"></b-pagination>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        Are you missing images or data collected? &nbsp; &nbsp; &nbsp;<a href="#">Email EMC Staff</a>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import store from "../store";
import {mapGetters, mapActions} from "vuex";

export default {
  name: "CollectionsPage",
  data() {
    return {
      filter: {
        fromDate: "",
        toDate: ""
      },
      fields: [
        {
          key: 'microscope',
          label: 'Microscope'
        },
        {
          key: 'collectionName',
          label: 'Collection'
        },
        {
          key: 'pi',
          label: 'Principle Investigator'
        },
        {
          key: 'status',
          label: 'Status'
        }
      ]
    }
  },
  store: store,
  computed: {
    ...mapGetters({
      getCollections: "collection/getCollections"
    }),
    collections() {
      const params = {
        fromDate: this.filter.fromDate,
        toDate: this.filter.toDate
      };

      return this.getCollections(params);
    }
  },
  methods: {
    ...mapActions({
      fetchCollections: "collection/fetchCollections"
    }),
    onRowSelected([{collectionId}]) {
      this.$router.push(`collections/${collectionId}`);
    },
  },
  mounted() {
    const params = {
      fromDate: this.filter.fromDate,
      toDate: this.filter.toDate
    };
    this.fetchCollections(params);
  }
}
</script>

<style scoped>
h2 {
  font-size: 30px;
}
</style>