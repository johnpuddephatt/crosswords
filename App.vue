<template>
  <div>
    <select v-model="crosswordID">
      <option v-for="id in [29504, 29503, 29502, 29501, 29500]" :value="id">
        Crossword #{{ id }}
      </option>
    </select>
    {{ cat }}
    <div ref="crossword"></div>

    <div v-if="crosswordModel" class="grid grid-cols-2">
      <div>
        <div v-for="clue in crosswordModel.downClues">
          {{ clue.clueLabel }} {{ clue.clueText }} {{ clue.answerLengthText }}
        </div>
      </div>
      <hr />
      <div>
        <div v-for="clue in crosswordModel.acrossClues">
          {{ clue.clueLabel }} {{ clue.clueText }} {{ clue.answerLengthText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "./libraries/crosswords-js/dist/crosswords.css";
import { CrosswordsJS } from "./libraries/crosswords-js/src/index.mjs";

export default {
  data() {
    return {
      crosswordID: 29504,
      crosswordData: null,
      crosswordModel: null,
      crosswordController: null,
      cat: "NaC",
    };
  },

  mounted() {
    console.log(this.$refs.crossword);
    // this.fetchAndBuildCrossword(this.crosswordID);

    localStorage.setItem("myCat", "Tom");
    this.cat = localStorage.getItem("myCat");
  },

  watch: {
    crosswordID() {
      console.log("trying", this.crosswordID);
      this.fetchAndBuildCrossword(this.crosswordID);
    },
  },

  methods: {
    fetchAndBuildCrossword(id) {
      fetch(
        "https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-ed3fd66e-24fe-4bd6-acc8-7352117dc861/default/crosswordGrabber.json?id=" +
          id
      )
        .then((response) => response.json())
        .then(
          (response) => (this.crosswordData = this.transformData(response.body))
        )
        .then((response) => console.log(this.crosswordData))
        .then((response) => this.buildCrossword());
    },
    buildCrossword() {
      this.$refs.crossword.innerHTML = "";
      try {
        this.crosswordModel = CrosswordsJS.compileCrossword(this.crosswordData);
      } catch (err) {
        console.log(`Error compiling crossword: ${err}`);
      }

      this.crosswordController = new CrosswordsJS.Controller(
        this.crosswordModel,
        this.$refs.crossword
      );
    },

    transformData(original) {
      const info = {
        source: original.creator.webUrl,
        title: original.name,
        setter: {
          title: original.creator.name,
          url: original.creator.webUrl,
        },
      };

      const width = original.dimensions.cols;
      const height = original.dimensions.rows;

      const acrossClues = original.entries
        .filter((entry) => entry.direction === "across")
        .map((entry) => ({
          x: entry.position.x + 1, // Convert to 1-based indexing
          y: entry.position.y + 1, // Convert to 1-based indexing
          clue: `${entry.humanNumber}. ${entry.clue}`,
          solution: entry.solution,
        }));

      const downClues = original.entries
        .filter((entry) => entry.direction === "down")
        .map((entry) => ({
          x: entry.position.x + 1, // Convert to 1-based indexing
          y: entry.position.y + 1, // Convert to 1-based indexing
          clue: `${entry.humanNumber}. ${entry.clue}`,
          solution: entry.solution,
        }));

      return {
        info,
        width,
        height,
        acrossClues,
        downClues,
      };
    },
  },
};
</script>
