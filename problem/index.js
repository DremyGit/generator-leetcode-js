var Generator = require('yeoman-generator');
var request = require('request');


module.exports = class extends Generator {
  async prompting() {
    const answers = await this.prompt([{
      type: 'input',
      name: 'id',
      message : 'ID of the problem',
      default : this.appname // Default to current folder name
    }])
    this.id = answers.id;
  }

  getProblemList() {
    var done = this.async();
    console.log('Requesting problem info...')
    request('https://leetcode.com/api/problems/all/', (err, res, body) => {
      if (err) {
        return done(err);
      }
      this.problemList = JSON.parse(body).stat_status_pairs;
      done()
    })
  }

  getProblem() {
      const problem = this.problemList.find(({ stat }) => stat.frontend_question_id === +this.id)
      if (!problem) {
        throw new Error(`Problem with id: ${this.id} is not exist`)
      }
      this.problem = problem.stat;
  }

  writing() {

    const {
      question__title: title,
      question__title_slug: titleSlug
    } = this.problem;


    const titleArr = title.split(/\s+/);

    console.log(`Created for ${this.id}. ${title}`);
    
    this.fs.copyTpl(
      this.templatePath('../../templates/problem/'),
      this.destinationPath(`src/${titleSlug}/`),
      {
        id: this.id,
        title,
        titleSlug,
        titleCamel: titleArr[0].toLowerCase() + titleArr.slice(1).map(word => word[0].toUpperCase() + word.slice(1)).join('')
      }
    );
  }
};