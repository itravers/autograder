class Course{
   /**
   * Course constructor.
   * @param {Number} id The course's ID number (integer).
   * @param {Number} school_id The ID of the school this course belongs to (integer). 
   * @param {String} name The course's name. 
   * @param {String} term The term in which this course is given. 
   * @param {Number} year The year in which this course is given. 
   * @param {Boolean} is_active True if this course is currently active. 
   * @param {Boolean} is_deleted True if this course has been deleted. 
   */
   constructor(id, school_id, name, term, year, is_active, is_deleted){
      this.id = id;
      this.school_id = school_id;
      this.name = name;
      this.term = term;
      this.year = year;
      this.is_active = is_active; 
      this.is_deleted = is_deleted;
   }
}