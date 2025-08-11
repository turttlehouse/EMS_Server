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
  })
  declare testId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
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
    allowNull: false,
  })
  declare submittedAt: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare score?: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isGraded: boolean;
}

export default Submission;
