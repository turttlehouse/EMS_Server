import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "submissions",
  modelName: "Submission",
  timestamps: true,
})
class Submission extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references:{
      model:'tests',
      key:'id'
    },
    onDelete:'RESTRICT',
    onUpdate:'CASCADE'
  })
  declare testId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references:{
      model : 'students',
      key : 'id'
    },
    onDelete:'RESTRICT',
    onUpdate:'CASCADE'
  })
  declare studentId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare startedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare endedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare submittedAt: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare score?: number;

  @Column({
    type : DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isScoreReleased: boolean;

}

export default Submission;
